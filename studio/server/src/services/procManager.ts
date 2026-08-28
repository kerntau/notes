import { spawn, ChildProcess } from 'child_process';
import { ROOT_DIR } from '../config';

export interface ProcessStatus {
  isRunning: boolean;
  pid?: number;
  mode: 'dev' | 'build' | 'idle';
  lastLog?: string;
  uptimeSeconds?: number;
}

class ProcessManager {
  private devProcess: ChildProcess | null = null;
  private startTime: number = 0;
  private logs: string[] = [];
  private maxLogs = 500;
  private listeners: ((log: string) => void)[] = [];

  constructor() {
    // 监听进程退出清理
    process.on('exit', () => {
      this.stopDev();
    });
  }

  public onLog(callback: (log: string) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  private broadcastLog(data: string) {
    const lines = data.split('\n');
    for (const line of lines) {
      if (!line) continue;
      const formatted = `[${new Date().toLocaleTimeString()}] ${line}`;
      this.logs.push(formatted);
      if (this.logs.length > this.maxLogs) {
        this.logs.shift();
      }
      this.listeners.forEach(cb => cb(formatted));
    }
  }

  public getRecentLogs(): string[] {
    return [...this.logs];
  }

  public getStatus(): ProcessStatus {
    const isRunning = !!this.devProcess && !this.devProcess.killed;
    return {
      isRunning,
      pid: this.devProcess?.pid,
      mode: isRunning ? 'dev' : 'idle',
      lastLog: this.logs[this.logs.length - 1],
      uptimeSeconds: isRunning ? Math.floor((Date.now() - this.startTime) / 1000) : 0,
    };
  }

  public startDev(): boolean {
    if (this.devProcess && !this.devProcess.killed) {
      this.broadcastLog('⚠️ Docusaurus 开发服务已在运行中');
      return false;
    }

    this.broadcastLog('🚀 正在启动 Docusaurus 本地开发服务器 (pnpm start)...');
    this.startTime = Date.now();

    // 在 Windows 下使用 shell 启动
    this.devProcess = spawn('pnpm', ['start', '--port', '3000'], {
      cwd: ROOT_DIR,
      shell: true,
      env: { ...process.env, FORCE_COLOR: 'true' },
    });

    this.devProcess.stdout?.on('data', data => {
      this.broadcastLog(data.toString());
    });

    this.devProcess.stderr?.on('data', data => {
      this.broadcastLog(data.toString());
    });

    this.devProcess.on('close', code => {
      this.broadcastLog(`⏹️ Docusaurus 进程退出，退出码: ${code}`);
      this.devProcess = null;
    });

    return true;
  }

  public stopDev(): boolean {
    if (!this.devProcess) {
      return false;
    }
    this.broadcastLog('🛑 正在停止 Docusaurus 服务...');
    try {
      if (process.platform === 'win32' && this.devProcess.pid) {
        spawn('taskkill', ['/pid', this.devProcess.pid.toString(), '/f', '/t']);
      } else {
        this.devProcess.kill('SIGTERM');
      }
    } catch (e) {}
    this.devProcess = null;
    return true;
  }

  public restartDev(): boolean {
    this.stopDev();
    return this.startDev();
  }

  public async runBuild(): Promise<{ success: boolean; output: string }> {
    this.broadcastLog('📦 开始执行 Docusaurus 生产构建 (pnpm build)...');
    return new Promise(resolve => {
      const proc = spawn('pnpm', ['build'], {
        cwd: ROOT_DIR,
        shell: true,
        env: { ...process.env, FORCE_COLOR: 'true' },
      });

      let fullOutput = '';

      proc.stdout?.on('data', data => {
        const text = data.toString();
        fullOutput += text;
        this.broadcastLog(text);
      });

      proc.stderr?.on('data', data => {
        const text = data.toString();
        fullOutput += text;
        this.broadcastLog(text);
      });

      proc.on('close', code => {
        const success = code === 0;
        this.broadcastLog(success ? '✅ 构建成功完成！' : `❌ 构建失败，错误码: ${code}`);
        resolve({ success, output: fullOutput });
      });
    });
  }
}

export const procManager = new ProcessManager();
