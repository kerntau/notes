import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { CONFIG_FILE, ROOT_DIR } from '../config';
import { writeAtomic } from '../services/fileService';

export const configRouter = Router();

function escapeTsString(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\r?\n/g, ' ');
}

// 1. 读取站点配置与公告信息
configRouter.get('/site', (req: Request, res: Response) => {
  try {
    const configContent = fs.readFileSync(CONFIG_FILE, 'utf-8');

    // 提取 title, tagline, announcementBar 内容
    const titleMatch = configContent.match(/title:\s*['"`](.*?)['"`]/);
    const taglineMatch = configContent.match(/tagline:\s*['"`](.*?)['"`]/);
    const announcementMatch = configContent.match(/content:\s*['"`](.*?)['"`]/);
    const announcementBarDisabled = !configContent.includes('announcementBar: {');

    // 检查首页 index.tsx 中的倒计时目标日期
    const indexTsxPath = path.join(ROOT_DIR, 'src/pages/index.tsx');
    let examDate = '2027-04-17T09:00:00+08:00';
    if (fs.existsSync(indexTsxPath)) {
      const indexContent = fs.readFileSync(indexTsxPath, 'utf-8');
      const dateMatch = indexContent.match(/new Date\(['"`](.*?)['"`]\)/);
      if (dateMatch) {
        examDate = dateMatch[1];
      }
    }

    res.json({
      success: true,
      data: {
        title: titleMatch ? titleMatch[1] : '序记',
        tagline: taglineMatch ? taglineMatch[1] : '个人知识库与博客记录',
        announcement: {
          enabled: !announcementBarDisabled,
          content: announcementMatch ? announcementMatch[1] : '🎉 欢迎莅临小站 🥳',
        },
        examDate,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. 更新公告与倒计时配置
configRouter.post('/site', (req: Request, res: Response) => {
  try {
   const { title, tagline, announcement, examDate } = req.body;
    if ((title !== undefined && typeof title !== 'string') || (tagline !== undefined && typeof tagline !== 'string') || (examDate !== undefined && typeof examDate !== 'string') || (announcement !== undefined && (!announcement || typeof announcement !== 'object' || (announcement.content !== undefined && typeof announcement.content !== 'string')))) {
      return res.status(400).json({ success: false, error: '配置字段格式无效' });
    }
    if ((typeof title === 'string' && title.length > 120) || (typeof tagline === 'string' && tagline.length > 240) || (typeof announcement?.content === 'string' && announcement.content.length > 500)) {
      return res.status(400).json({ success: false, error: '配置字段长度超出限制' });
    }

   // 1. 更新 docusaurus.config.ts 中的字段
    let configContent = fs.readFileSync(CONFIG_FILE, 'utf-8');

    if (title) {
      configContent = configContent.replace(/title:\s*['"`].*?['"`]/, `title: '${escapeTsString(String(title))}'`);
    }
    if (tagline) {
      configContent = configContent.replace(/tagline:\s*['"`].*?['"`]/, `tagline: '${escapeTsString(String(tagline))}'`);
    }
   if (announcement && announcement.content) {
     configContent = configContent.replace(/content:\s*['"`].*?['"`]/, `content: '${escapeTsString(String(announcement.content))}'`);
   }
    if (announcement && typeof announcement.enabled === 'boolean') {
      const barPattern = /\n    announcementBar: \{[\s\S]*?\n    \},/;
      if (announcement.enabled) {
        const content = escapeTsString(String(announcement.content || ''));
        const announcementBlock = `\n    announcementBar: {\n      id: 'studio_announcement',\n      content: '${content}',\n      isCloseable: true,\n    },`;
        configContent = barPattern.test(configContent) ? configContent.replace(barPattern, announcementBlock) : configContent.replace(/\n    colorMode:/, announcementBlock + '\n    colorMode:');
      } else {
        configContent = configContent.replace(barPattern, '');
      }
    }

    writeAtomic(CONFIG_FILE, configContent);

    // 2. 更新 index.tsx 中的考期倒计时
    if (examDate) {
      const indexTsxPath = path.join(ROOT_DIR, 'src/pages/index.tsx');
      if (fs.existsSync(indexTsxPath)) {
        let indexContent = fs.readFileSync(indexTsxPath, 'utf-8');
       indexContent = indexContent.replace(
         /new Date\(['"`].*?['"`]\)/,
          `new Date('${escapeTsString(examDate)}')`
       );
        writeAtomic(indexTsxPath, indexContent);
      }
    }

    res.json({
      success: true,
      message: '站点配置与考期倒计时已成功更新',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
