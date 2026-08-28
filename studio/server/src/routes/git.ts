import { Router, Request, Response } from 'express';
import { gitManager } from '../services/gitManager';

export const gitRouter = Router();

// 1. 获取 Git 工作区状态
gitRouter.get('/status', (req: Request, res: Response) => {
  try {
    const status = gitManager.getStatus();
    res.json({ success: true, data: status });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. 查看文件 Diff
gitRouter.get('/diff', (req: Request, res: Response) => {
  try {
    const file = req.query.file as string;
    const diff = gitManager.getDiff(file);
    res.json({ success: true, data: { diff } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. 暂存/取消暂存文件
gitRouter.post('/stage', (req: Request, res: Response) => {
  try {
    const { file, staged } = req.body;
    if (!file) {
      return res.status(400).json({ success: false, error: '缺少 file 参数' });
    }

    if (staged) {
      gitManager.stageFile(file);
    } else {
      gitManager.unstageFile(file);
    }

    res.json({ success: true, message: staged ? '文件已暂存' : '已取消暂存' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. 规范化原子提交
gitRouter.post('/commit', (req: Request, res: Response) => {
  try {
    const { type, scope, subject, body } = req.body;
    if (!type || !subject) {
      return res.status(400).json({ success: false, error: '缺少 type 或 subject' });
    }
    if (typeof type !== 'string' || typeof subject !== 'string' || (typeof scope !== 'undefined' && typeof scope !== 'string') || (typeof body !== 'undefined' && typeof body !== 'string')) {
      return res.status(400).json({ success: false, error: '提交字段格式无效' });
    }
    if (subject.trim().length > 72) {
      return res.status(400).json({ success: false, error: '提交说明不能超过 72 个字符' });
    }
    if (!/^[a-z]+$/.test(type)) {
      return res.status(400).json({ success: false, error: '提交类型只能包含小写字母' });
    }

    const output = gitManager.commit(type, scope || '', subject, body);
    res.json({ success: true, message: '提交成功', data: output });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
