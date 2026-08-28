import { Router, Request, Response } from 'express';
import { procManager } from '../services/procManager';

export const devopsRouter = Router();

// 1. 获取进程状态与近期日志
devopsRouter.get('/status', (req: Request, res: Response) => {
  try {
    const status = procManager.getStatus();
    const logs = procManager.getRecentLogs();
    res.json({
      success: true,
      data: {
        status,
        logs,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. 触发进程动作 (start | stop | restart | build)
devopsRouter.post('/action', async (req: Request, res: Response) => {
  try {
    const { action } = req.body;
    if (!action) {
      return res.status(400).json({ success: false, error: '缺少 action 参数' });
    }

    if (action === 'start') {
      const ok = procManager.startDev();
      return res.json({ success: ok, message: ok ? '开发服务启动中' : '开发服务已在运行' });
    } else if (action === 'stop') {
      const ok = procManager.stopDev();
      return res.json({ success: ok, message: ok ? '开发服务已停止' : '服务未运行' });
    } else if (action === 'restart') {
      const ok = procManager.restartDev();
      return res.json({ success: ok, message: '开发服务正在重启' });
    } else if (action === 'build') {
      const result = await procManager.runBuild();
      return res.json({ success: result.success, message: result.success ? '构建成功' : '构建失败', output: result.output });
    } else {
      return res.status(400).json({ success: false, error: `不支持的动作: ${action}` });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
