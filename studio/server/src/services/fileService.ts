import fs from 'fs';
import path from 'path';
import { ROOT_DIR, BACKUP_DIR } from '../config';
import { resolveSafePath } from '../middleware/pathGuard';
import { parseDoc } from './docParser';

export interface FileNode {
  name: string;
  relativePath: string;
  fullPath: string;
  isDirectory: boolean;
  sizeBytes?: number;
  updatedAt?: string;
  title?: string;
  sidebarPosition?: number;
  tags?: string[];
  children?: FileNode[];
}

/**
 * 递归构建目录树
 */
export function getDirectoryTree(baseDir: string, rootRelative = ''): FileNode[] {
  if (!fs.existsSync(baseDir)) return [];

  const entries = fs.readdirSync(baseDir, { withFileTypes: true });
  const nodes: FileNode[] = [];

  for (const entry of entries) {
    // 过滤隐藏文件与系统目录
    if (entry.name.startsWith('.')) continue;

    const fullPath = path.join(baseDir, entry.name);
    const relPath = rootRelative ? `${rootRelative}/${entry.name}` : entry.name;

    if (entry.isDirectory()) {
      const children = getDirectoryTree(fullPath, relPath);
      nodes.push({
        name: entry.name,
        relativePath: relPath,
        fullPath,
        isDirectory: true,
        children,
      });
    } else if (entry.name.endsWith('.md') || entry.name.endsWith('.mdx')) {
      const stat = fs.statSync(fullPath);
      let title = entry.name.replace(/\.mdx?$/, '');
      let sidebarPosition: number | undefined;
      let tags: string[] | undefined;

      try {
        const raw = fs.readFileSync(fullPath, 'utf-8');
        const parsed = parseDoc(raw);
        if (parsed.frontmatter.title) {
          title = String(parsed.frontmatter.title);
        } else if (parsed.frontmatter.sidebar_label) {
          title = String(parsed.frontmatter.sidebar_label);
        }
        if (parsed.frontmatter.sidebar_position !== undefined) {
          sidebarPosition = Number(parsed.frontmatter.sidebar_position);
        }
        if (Array.isArray(parsed.frontmatter.tags)) {
          tags = parsed.frontmatter.tags.map(String);
        }
      } catch (e) {}

      nodes.push({
        name: entry.name,
        relativePath: relPath,
        fullPath,
        isDirectory: false,
        sizeBytes: stat.size,
        updatedAt: stat.mtime.toISOString(),
        title,
        sidebarPosition,
        tags,
      });
    }
  }

  // 排序：目录优先，其次按 sidebarPosition / 名称
  nodes.sort((a, b) => {
    if (a.isDirectory && !b.isDirectory) return -1;
    if (!a.isDirectory && b.isDirectory) return 1;
    if (a.sidebarPosition !== undefined && b.sidebarPosition !== undefined) {
      return a.sidebarPosition - b.sidebarPosition;
    }
    return a.name.localeCompare(b.name, 'zh-Hans-CN', { numeric: true });
  });

  return nodes;
}

/**
 * 备份文件到快照目录
 */
export function backupFile(targetFilePath: string): void {
  try {
    if (!fs.existsSync(targetFilePath)) return;
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }

    const relPath = path.relative(ROOT_DIR, targetFilePath).replace(/[\\/]/g, '_');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `${relPath}.${timestamp}.bak`;
    const backupPath = path.join(BACKUP_DIR, backupFileName);

    fs.copyFileSync(targetFilePath, backupPath);

    // 清理过多备份，保留最新 50 个
    const backups = fs.readdirSync(BACKUP_DIR)
      .map(name => ({ name, time: fs.statSync(path.join(BACKUP_DIR, name)).mtimeMs }))
      .sort((a, b) => b.time - a.time);

    if (backups.length > 50) {
      for (const oldFile of backups.slice(50)) {
        try {
          fs.unlinkSync(path.join(BACKUP_DIR, oldFile.name));
        } catch (e) {}
      }
    }
  } catch (err: any) {
    console.error('备份失败:', err.message);
  }
}

/**
 * 原子写入文件
 */
export function writeAtomic(targetFilePath: string, content: string): void {
  const safePath = resolveSafePath(targetFilePath);
  const dir = path.dirname(safePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // 1. 先备份
  backupFile(safePath);

  // 2. 写入临时文件再原子替换
  const tempPath = `${safePath}.${Date.now()}.tmp`;
  fs.writeFileSync(tempPath, content, 'utf-8');
  fs.renameSync(tempPath, safePath);
}

/**
 * 读取文件
 */
export function readFileSafe(targetFilePath: string): string {
  const safePath = resolveSafePath(targetFilePath);
  if (!fs.existsSync(safePath)) {
    throw new Error(`文件不存在: ${targetFilePath}`);
  }
  return fs.readFileSync(safePath, 'utf-8');
}

/**
 * 删除文件或目录
 */
export function removeFileSafe(targetPath: string): void {
  const safePath = resolveSafePath(targetPath);
  if (!fs.existsSync(safePath)) return;

  const stat = fs.statSync(safePath);
  if (stat.isDirectory()) {
    fs.rmSync(safePath, { recursive: true, force: true });
  } else {
    backupFile(safePath);
    fs.unlinkSync(safePath);
  }
}

/**
 * 重命名 / 移动文件
 */
export function moveFileSafe(sourcePath: string, destPath: string): void {
  const safeSource = resolveSafePath(sourcePath);
  const safeDest = resolveSafePath(destPath);

 if (!fs.existsSync(safeSource)) {
   throw new Error(`源文件不存在: ${sourcePath}`);
 }
  if (fs.existsSync(safeDest)) {
    throw new Error(`目标路径已存在，拒绝覆盖: ${destPath}`);
  }

 const destDir = path.dirname(safeDest);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  fs.renameSync(safeSource, safeDest);
}
