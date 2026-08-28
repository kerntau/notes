import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { STATIC_IMG_DIR, DOCS_DIR, BLOG_DIR, ROOT_DIR } from '../config';
import { resolveSafePath } from '../middleware/pathGuard';
import { removeFileSafe } from '../services/fileService';

export const mediaRouter = Router();

function resolveManagedMediaPath(input: string): string {
  const staticRel = input.startsWith('/') ? input.substring(1) : input;
  const target = resolveSafePath(path.join('static', staticRel));
  const relative = path.relative(STATIC_IMG_DIR, target);
  if (relative.startsWith('..' + path.sep) || path.isAbsolute(relative)) throw new Error('只能操作 static/img 目录中的媒体');
  return target;
}

// 配置文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(STATIC_IMG_DIR)) {
      fs.mkdirSync(STATIC_IMG_DIR, { recursive: true });
    }
    cb(null, STATIC_IMG_DIR);
  },
  filename: (req, file, cb) => {
    // 处理文件名中文与特殊字符
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_\-\u4e00-\u9fa5]/g, '_');
    cb(null, `${base}_${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 限制 20MB
});

function getAllImages(dir: string): Array<{ name: string; relativePath: string; sizeBytes: number; updatedAt: string }> {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let results: Array<{ name: string; relativePath: string; sizeBytes: number; updatedAt: string }> = [];

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(getAllImages(full));
    } else if (/\.(png|jpe?g|gif|webp|svg|ico)$/i.test(entry.name)) {
      const stat = fs.statSync(full);
      const relToStatic = path.relative(path.join(ROOT_DIR, 'static'), full).replace(/\\/g, '/');
      results.push({
        name: entry.name,
        relativePath: `/${relToStatic}`,
        sizeBytes: stat.size,
        updatedAt: stat.mtime.toISOString(),
      });
    }
  }
  return results;
}

// 1. 获取图片列表
mediaRouter.get('/list', (req: Request, res: Response) => {
  try {
    const images = getAllImages(STATIC_IMG_DIR);
    res.json({ success: true, data: images });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. 上传图片
// 工作区同时存在 Express 4/5 类型声明，multer 的 Express 4 中间件在这里做局部适配。
mediaRouter.post('/upload', upload.array('files', 10) as any, (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, error: '未接收到上传文件' });
    }

    const uploaded = files.map(file => {
      const relToStatic = path.relative(path.join(ROOT_DIR, 'static'), file.path).replace(/\\/g, '/');
      return {
        name: file.filename,
        relativePath: `/${relToStatic}`,
        sizeBytes: file.size,
      };
    });

    res.json({ success: true, data: uploaded });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. 删除图片
mediaRouter.delete('/delete', (req: Request, res: Response) => {
  try {
    const relPath = req.query.path as string;
    if (!relPath) {
      return res.status(400).json({ success: false, error: '缺少 path 参数' });
    }

    // relPath 类似于 /img/xxx.png -> static/img/xxx.png
   const targetFull = resolveManagedMediaPath(relPath);
    if (!fs.existsSync(targetFull) || !fs.statSync(targetFull).isFile()) {
      return res.status(400).json({ success: false, error: '只能删除已存在的图片文件' });
    }
    if (!/\.(png|jpe?g|gif|webp|svg|ico)$/i.test(targetFull)) {
      return res.status(400).json({ success: false, error: '不支持删除该类型的媒体文件' });
    }

   removeFileSafe(targetFull);
    res.json({ success: true, message: '删除成功' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. 扫描孤儿未引用图片
mediaRouter.get('/orphans', (req: Request, res: Response) => {
  try {
    const allImages = getAllImages(STATIC_IMG_DIR);

    // 收集所有 Markdown 文件内容
    const mdContents: string[] = [];
    function scanDocs(dir: string) {
      if (!fs.existsSync(dir)) return;
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          scanDocs(full);
        } else if (entry.name.endsWith('.md') || entry.name.endsWith('.mdx')) {
          try {
            mdContents.push(fs.readFileSync(full, 'utf-8'));
          } catch (e) {}
        }
      }
    }

    scanDocs(DOCS_DIR);
    scanDocs(BLOG_DIR);
    // 同时扫描 custom.css 与 pages 源码
    const srcDir = path.join(ROOT_DIR, 'src');
    if (fs.existsSync(srcDir)) {
      function scanSrc(dir: string) {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const full = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            scanSrc(full);
          } else if (/\.(tsx|ts|jsx|js|css)$/.test(entry.name)) {
            try {
              mdContents.push(fs.readFileSync(full, 'utf-8'));
            } catch (e) {}
          }
        }
      }
      scanSrc(srcDir);
    }

    const combinedContent = mdContents.join('\n');

    // 检查每个图片是否在 combinedContent 中出现
    const orphans = allImages.filter(img => {
      const imgName = img.name;
      const relPath = img.relativePath;
      return !combinedContent.includes(imgName) && !combinedContent.includes(relPath);
    });

    res.json({
      success: true,
      data: {
        totalImages: allImages.length,
        orphansCount: orphans.length,
        orphans,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
