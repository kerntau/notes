import { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { DOCS_DIR, BLOG_DIR, ROOT_DIR } from '../config';
import { getDirectoryTree, readFileSafe, writeAtomic, removeFileSafe, moveFileSafe } from '../services/fileService';
import { parseDoc, stringifyDoc } from '../services/docParser';
import { resolveSafePath } from '../middleware/pathGuard';

export const docsRouter = Router();

function resolveManagedDocPath(input: string, allowRoot = false): string {
  const resolved = resolveSafePath(input);
  const relative = path.relative(ROOT_DIR, resolved);
  const managed = relative === 'docs' || relative.startsWith(`docs${path.sep}`) || relative === 'blog' || relative.startsWith(`blog${path.sep}`);
  const isRoot = relative === 'docs' || relative === 'blog';
  if (!managed || (!allowRoot && isRoot)) throw new Error('只能操作 docs 或 blog 目录中的文档内容');
  return resolved;
}

// 1. 获取文档目录树
docsRouter.get('/tree', (req: Request, res: Response) => {
  try {
    const docsTree = getDirectoryTree(DOCS_DIR, 'docs');
    const blogTree = fs.existsSync(BLOG_DIR) ? getDirectoryTree(BLOG_DIR, 'blog') : [];

    res.json({
      success: true,
      data: [
        {
          name: 'docs (知识库笔记)',
          relativePath: 'docs',
          fullPath: DOCS_DIR,
          isDirectory: true,
          children: docsTree,
        },
        ...(blogTree.length > 0
          ? [
              {
                name: 'blog (博客专栏)',
                relativePath: 'blog',
                fullPath: BLOG_DIR,
                isDirectory: true,
                children: blogTree,
              },
            ]
          : []),
      ],
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. 获取文档详情
docsRouter.get('/detail', (req: Request, res: Response) => {
  try {
    const relPath = req.query.path as string;
    if (!relPath) {
      return res.status(400).json({ success: false, error: '缺少 path 参数' });
    }

    const fullPath = resolveManagedDocPath(relPath);
    const raw = readFileSafe(fullPath);
    const parsed = parseDoc(raw);
    const stat = fs.statSync(fullPath);

    res.json({
      success: true,
      data: {
        relativePath: path.relative(ROOT_DIR, fullPath).replace(/\\/g, '/'),
        filename: path.basename(fullPath),
        frontmatter: parsed.frontmatter,
        content: parsed.content,
        raw,
        sizeBytes: stat.size,
        updatedAt: stat.mtime.toISOString(),
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. 保存文档
docsRouter.post('/save', (req: Request, res: Response) => {
  try {
    const { path: relPath, frontmatter, content, raw } = req.body;
    if (!relPath) {
      return res.status(400).json({ success: false, error: '缺少 path 参数' });
    }

    const fullPath = resolveManagedDocPath(relPath);

    let finalContent = '';
    if (typeof raw === 'string' && !frontmatter) {
      finalContent = raw;
    } else {
      finalContent = stringifyDoc(frontmatter || {}, content || '');
    }

    writeAtomic(fullPath, finalContent);

    res.json({
      success: true,
      message: '文档保存成功并已自动备份快照',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. 创建文档或目录
docsRouter.post('/create', (req: Request, res: Response) => {
  try {
    const { parentPath = 'docs', name, isDirectory, initialTitle } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, error: '缺少名称' });
    }

    const cleanName = name.replace(/[\\/:*?"<>|]/g, '-');
    const safeParent = resolveManagedDocPath(parentPath, true);
    const targetRel = path.relative(ROOT_DIR, path.join(safeParent, isDirectory ? cleanName : (cleanName.endsWith('.md') || cleanName.endsWith('.mdx') ? cleanName : `${cleanName}.md`)));
    const targetFull = resolveManagedDocPath(targetRel);

    if (fs.existsSync(targetFull)) {
      return res.status(400).json({ success: false, error: '目标文件或目录已存在' });
    }

    if (isDirectory) {
      fs.mkdirSync(targetFull, { recursive: true });
    } else {
      const title = initialTitle || cleanName.replace(/\.mdx?$/, '');
      const defaultContent = stringifyDoc(
        {
          title,
          sidebar_position: 1,
          description: `${title} 笔记内容`,
          tags: ['专升本', '笔记'],
        },
        `# ${title}\n\n在这里开始编写您的学习笔记...\n`
      );
      writeAtomic(targetFull, defaultContent);
    }

    res.json({
      success: true,
      data: {
        relativePath: path.relative(ROOT_DIR, targetFull).replace(/\\/g, '/'),
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. 移动 / 重命名
docsRouter.post('/move', (req: Request, res: Response) => {
  try {
    const { sourcePath, destPath } = req.body;
    if (!sourcePath || !destPath) {
      return res.status(400).json({ success: false, error: '缺少路径参数' });
    }
    resolveManagedDocPath(sourcePath);
    resolveManagedDocPath(destPath);
    moveFileSafe(sourcePath, destPath);
    res.json({ success: true, message: '移动成功' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. 删除文档
docsRouter.delete('/delete', (req: Request, res: Response) => {
  try {
    const relPath = req.query.path as string;
    if (!relPath) {
      return res.status(400).json({ success: false, error: '缺少 path 参数' });
    }
    resolveManagedDocPath(relPath);
    removeFileSafe(relPath);
    res.json({ success: true, message: '删除成功' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
