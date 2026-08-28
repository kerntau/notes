import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { DOCS_DIR, BLOG_DIR, DATA_DIR, ROOT_DIR } from '../config';
import { parseDoc } from '../services/docParser';

export const statsRouter = Router();

// 1. 获取全站字数与统计大盘
statsRouter.get('/overview', (req: Request, res: Response) => {
  try {
    const statsPath = path.join(DATA_DIR, 'stats.json');
    let statsData: any = {};
    if (fs.existsSync(statsPath)) {
      statsData = JSON.parse(fs.readFileSync(statsPath, 'utf-8'));
    }

    // 扫描各分类文档数量与字数分布
    const docCategories: Record<string, { count: number; words: number }> = {};

    function scanDir(dir: string, categoryName: string) {
      if (!fs.existsSync(dir)) return;
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          scanDir(full, `${categoryName}/${entry.name}`);
        } else if (entry.name.endsWith('.md') || entry.name.endsWith('.mdx')) {
          const content = fs.readFileSync(full, 'utf-8');
          const clean = content.replace(/^---[\s\S]*?---/, '');
          const cjkMatches = clean.match(/[\u4e00-\u9fa5]/g);
          const cjkCount = cjkMatches ? cjkMatches.length : 0;
          const engMatches = clean.replace(/[\u4e00-\u9fa5]/g, ' ').match(/[a-zA-Z0-9_-]+/g);
          const engCount = engMatches ? engMatches.length : 0;
          const words = cjkCount + engCount;

          if (!docCategories[categoryName]) {
            docCategories[categoryName] = { count: 0, words: 0 };
          }
          docCategories[categoryName].count += 1;
          docCategories[categoryName].words += words;
        }
      }
    }

    scanDir(DOCS_DIR, 'docs');
    if (fs.existsSync(BLOG_DIR)) scanDir(BLOG_DIR, 'blog');

    res.json({
      success: true,
      data: {
        ...statsData,
        categories: docCategories,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. 健康检查（死链、损坏图片、缺少 Frontmatter 诊断）
statsRouter.get('/health', (req: Request, res: Response) => {
  try {
    const issues: Array<{
      file: string;
      type: 'broken_link' | 'broken_image' | 'missing_metadata' | 'warning';
      message: string;
      target?: string;
    }> = [];

    function checkDoc(filePath: string) {
      const relPath = path.relative(ROOT_DIR, filePath).replace(/\\/g, '/');
      const raw = fs.readFileSync(filePath, 'utf-8');
      const { frontmatter, content } = parseDoc(raw);

      // 检查 frontmatter 完整性
      if (!frontmatter.title) {
        issues.push({
          file: relPath,
          type: 'missing_metadata',
          message: '未显式配置 frontmatter 中的 title 属性',
        });
      }

      // 检查 Markdown 链接与图片引用
      const linkRegex = /\[([^\]]*)\]\(([^)]+)\)/g;
      let match;
      while ((match = linkRegex.exec(content)) !== null) {
        const url = match[2].trim();
        // 忽略外部网络链接和锚点
        if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('#') || url.startsWith('mailto:')) {
          continue;
        }

        // 检查本地静态图片 /img/...
        if (url.startsWith('/img/')) {
          const imgPath = path.join(ROOT_DIR, 'static', url.replace(/^\/+/, ''));
          if (!fs.existsSync(imgPath)) {
            issues.push({
              file: relPath,
              type: 'broken_image',
              message: `引用的本地静态图片不存在`,
              target: url,
            });
          }
        }
        // 检查相对文档链接
        else if (url.endsWith('.md') || url.endsWith('.mdx') || url.startsWith('./') || url.startsWith('../')) {
          const cleanTarget = url.split('#')[0].split('?')[0];
          if (cleanTarget) {
            const targetPath = path.resolve(path.dirname(filePath), cleanTarget);
            if (!fs.existsSync(targetPath)) {
              issues.push({
                file: relPath,
                type: 'broken_link',
                message: `引用的相对文档路径不存在`,
                target: url,
              });
            }
          }
        }
      }
    }

    function scanDocs(dir: string) {
      if (!fs.existsSync(dir)) return;
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          scanDocs(full);
        } else if (entry.name.endsWith('.md') || entry.name.endsWith('.mdx')) {
          checkDoc(full);
        }
      }
    }

    scanDocs(DOCS_DIR);
    scanDocs(BLOG_DIR);

    res.json({
      success: true,
      data: {
        totalIssues: issues.length,
        issues,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
