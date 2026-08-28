import { execFileSync } from 'child_process';
import { ROOT_DIR } from '../config';

export interface GitFileStatus {
  path: string;
  status: 'modified' | 'added' | 'deleted' | 'untracked' | 'renamed';
  staged: boolean;
}

export interface GitRepoStatus {
  currentBranch: string;
  isClean: boolean;
  files: GitFileStatus[];
  lastCommit?: {
    hash: string;
    message: string;
    author: string;
    date: string;
  };
}

class GitManager {
  private runGit(args: string[]): string {
    try {
      return execFileSync('git', args, {
        cwd: ROOT_DIR,
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
      }).trim();
    } catch (err: any) {
      throw new Error(`Git 命令执行失败: ${err.stderr || err.message}`);
    }
  }

  public getStatus(): GitRepoStatus {
    try {
      const branch = this.runGit(['rev-parse', '--abbrev-ref', 'HEAD']);
      const rawStatus = this.runGit(['status', '--porcelain']);

      const files: GitFileStatus[] = [];

      if (rawStatus) {
        const lines = rawStatus.split('\n');
        for (const line of lines) {
          if (!line) continue;
          const indexCode = line.substring(0, 1);
          const workCode = line.substring(1, 2);
          const filePath = line.substring(3).trim().replace(/^"|"$/g, '');

          let status: GitFileStatus['status'] = 'modified';
          let staged = indexCode !== ' ' && indexCode !== '?';

          if (indexCode === '?' || workCode === '?') {
            status = 'untracked';
          } else if (indexCode === 'A' || workCode === 'A') {
            status = 'added';
          } else if (indexCode === 'D' || workCode === 'D') {
            status = 'deleted';
          } else if (indexCode === 'R' || workCode === 'R') {
            status = 'renamed';
          }

          files.push({
            path: filePath,
            status,
            staged,
          });
        }
      }

      let lastCommit;
      try {
        const logLine = this.runGit(['log', '-1', '--pretty=format:%h|||%s|||%an|||%cd', '--date=iso']);
        const [hash, message, author, date] = logLine.split('|||');
        lastCommit = { hash, message, author, date };
      } catch (e) {}

      return {
        currentBranch: branch,
        isClean: files.length === 0,
        files,
        lastCommit,
      };
    } catch (e: any) {
      throw new Error(`无法读取 Git 工作区状态: ${e.message || e}`);
    }
  }

  public getDiff(filePath?: string): string {
    const args = ['diff'];
    if (filePath) {
      args.push('--', filePath);
    }
    return this.runGit(args);
  }

  public stageFile(filePath: string): void {
    this.runGit(['add', filePath]);
  }

  public unstageFile(filePath: string): void {
    this.runGit(['restore', '--staged', filePath]);
  }

  public commit(type: string, scope: string, subject: string, body?: string): string {
    const header = scope ? `${type}(${scope}): ${subject}` : `${type}: ${subject}`;
    let fullMsg = header;
    if (body) {
      fullMsg += `\n\n${body.trim()}`;
    }

    // 使用参数数组传递完整提交信息，避免 shell 拼接和临时文件竞争。
    return this.runGit(['commit', '-m', fullMsg]);
  }
}

export const gitManager = new GitManager();
