import matter from 'gray-matter';

export interface ParsedDoc {
  frontmatter: Record<string, any>;
  content: string;
  raw: string;
}

/**
 * 解析 Markdown/MDX 文件内容与 Frontmatter
 */
export function parseDoc(rawText: string): ParsedDoc {
  try {
    const parsed = matter(rawText);
    return {
      frontmatter: parsed.data || {},
      content: parsed.content || '',
      raw: rawText,
    };
  } catch (err: any) {
    return {
      frontmatter: {},
      content: rawText,
      raw: rawText,
    };
  }
}

/**
 * 将 Frontmatter 与 Markdown 正文组合序列化
 */
export function stringifyDoc(frontmatter: Record<string, any>, content: string): string {
  if (!frontmatter || Object.keys(frontmatter).length === 0) {
    return content;
  }
  return matter.stringify(content, frontmatter);
}
