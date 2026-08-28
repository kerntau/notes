import express from 'express';
import cors from 'cors';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { WebSocketServer, WebSocket } from 'ws';
import chokidar from 'chokidar';

import { SERVER_PORT, HOST, DOCS_DIR, STATIC_IMG_DIR, ROOT_DIR } from './config';
import { docsRouter } from './routes/docs';
import { mediaRouter } from './routes/media';
import { statsRouter } from './routes/stats';
import { configRouter } from './routes/config';
import { devopsRouter } from './routes/devops';
import { gitRouter } from './routes/git';
import { procManager } from './services/procManager';

const app = express();
const server = http.createServer(app);

// 1. 中间件
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));


// 2. 静态资源代理（用于媒体预览）
app.use('/img', express.static(STATIC_IMG_DIR));
app.use('/static', express.static(path.join(ROOT_DIR, 'static')));

// 3. API 路由
app.use('/api/v1/docs', docsRouter);
app.use('/api/v1/media', mediaRouter);
app.use('/api/v1/stats', statsRouter);
app.use('/api/v1/config', configRouter);
app.use('/api/v1/devops', devopsRouter);
app.use('/api/v1/git', gitRouter);
app.use('/api', (req, res) => {
  res.status(404).json({ success: false, error: 'API 路径不存在' });
});

// 4. 托管前端构建产物（若存在）
const publicDir = path.join(__dirname, '../public');
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/img') || req.path.startsWith('/ws')) {
      return next();
    }
    res.sendFile(path.join(publicDir, 'index.html'));
  });
}

// 错误处理中间件必须位于所有路由之后，才能统一捕获上传和 API 异常。
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (res.headersSent) return next(err);
  const status = err?.code === "LIMIT_FILE_SIZE" ? 413 : 500;
  const message = err?.code === "LIMIT_FILE_SIZE" ? "上传文件不能超过 20MB" : (err?.message || "服务器内部错误");
  res.status(status).json({ success: false, error: message });
});

// 5. WebSocket 实时双向通信
const wss = new WebSocketServer({ server, path: '/ws' });
const clients = new Set<WebSocket>();

wss.on('connection', ws => {
  clients.add(ws);

  // 连接时推送近期日志
  const recentLogs = procManager.getRecentLogs();
  ws.send(JSON.stringify({ type: 'LOG_BATCH', data: recentLogs }));
  ws.send(JSON.stringify({ type: 'STATUS_UPDATE', data: procManager.getStatus() }));

  ws.on('close', () => {
    clients.delete(ws);
  });
});

function broadcast(msg: { type: string; data: any }) {
  const payload = JSON.stringify(msg);
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
}

// 监听 Docusaurus 子进程日志并推送到前端
procManager.onLog(log => {
  broadcast({ type: 'LOG', data: log });
});

// 监听文件系统变动（热同步）
const watcher = chokidar.watch([DOCS_DIR, STATIC_IMG_DIR], {
  ignoreInitial: true,
  depth: 6,
  ignored: /(^|[\/\\])\../,
});

watcher.on('all', (event, filePath) => {
  const relPath = path.relative(ROOT_DIR, filePath).replace(/\\/g, '/');
  broadcast({
    type: 'FILE_CHANGE',
    data: { event, path: relPath },
  });
});

// 6. 启动服务
server.listen(SERVER_PORT, HOST, () => {
  console.log(`\n✨ =================================================`);
  console.log(`🚀 Notes Studio (本地后台管理系统服务) 启动成功！`);
  console.log(`📡 服务地址: http://${HOST}:${SERVER_PORT}`);
  console.log(`✨ =================================================\n`);
});
