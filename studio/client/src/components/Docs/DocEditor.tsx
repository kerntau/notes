import React, { useState, useEffect } from 'react';
import {
  Save,
  Code,
  Image as ImageIcon,
  Table,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Eye,
  Columns,
  Maximize2,
} from 'lucide-react';
import { marked } from 'marked';

const SAFE_HTML_TAGS = new Set([
  'A', 'B', 'BLOCKQUOTE', 'BR', 'CODE', 'DEL', 'EM', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
  'HR', 'I', 'LI', 'OL', 'P', 'PRE', 'S', 'STRONG', 'TABLE', 'TBODY', 'TD', 'TH', 'THEAD',
  'TR', 'UL', 'SPAN', 'DIV', 'IMG',
  // KaTeX 的 MathML 输出标签
  'ANNOTATION', 'MATH', 'MI', 'MN', 'MO', 'MROW', 'MS', 'MSPACE', 'MTEXT', 'SEMANTICS'
]);

function sanitizePreviewHtml(html: string): string {
  const template = document.createElement('template');
  template.innerHTML = html;
  const walker = document.createTreeWalker(template.content, NodeFilter.SHOW_ELEMENT);
  const elements: Element[] = [];
  let current = walker.nextNode();
  while (current) {
    elements.push(current as Element);
    current = walker.nextNode();
  }

  for (const element of elements) {
    if (!SAFE_HTML_TAGS.has(element.tagName)) {
      element.remove();
      continue;
    }
    for (const attribute of Array.from(element.attributes)) {
      const name = attribute.name.toLowerCase();
      const value = attribute.value.trim();
      if (name.startsWith('on') || name === 'srcdoc' || name === 'formaction') {
        element.removeAttribute(attribute.name);
      } else if (name === 'style') {
        const safeStyle = value
          .split(';')
          .map(rule => rule.trim())
          .filter(rule => {
            const separator = rule.indexOf(':');
            if (separator <= 0) return false;
            const property = rule.slice(0, separator).trim().toLowerCase();
            const declaration = rule.slice(separator + 1).trim();
            return /^[a-z-]+$/.test(property)
              && declaration.length <= 300
              && !/[<>]/.test(declaration)
              && !/(url\s*\(|expression\s*\(|@import|javascript\s*:)/i.test(declaration);
          })
          .join('; ');
        if (safeStyle) element.setAttribute('style', safeStyle);
        else element.removeAttribute('style');
      } else if ((name === 'href' || name === 'src') && !/^(https?:|mailto:|\/|#)/i.test(value)) {
        element.removeAttribute(attribute.name);
      } else if (name === 'href' || name === 'src') {
        element.setAttribute(attribute.name, value.replace(/[\u0000-\u001f\u007f]/g, ''));
      }
    }
  }
  return template.innerHTML;
}
import katex from 'katex';
import { DocDetail } from '../../types';
import { FrontmatterForm } from './FrontmatterForm';

interface DocEditorProps {
  doc: DocDetail;
  onSave: (docData: { path: string; frontmatter: Record<string, any>; content: string }) => Promise<void>;
  onDirtyChange?: (dirty: boolean) => void;
  onOpenMediaSelector?: () => void;
}

export const DocEditor: React.FC<DocEditorProps> = ({ doc, onSave, onDirtyChange, onOpenMediaSelector }) => {
  const [frontmatter, setFrontmatter] = useState<Record<string, any>>(doc.frontmatter || {});
  const [content, setContent] = useState<string>(doc.content || '');
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const [dirty, setDirty] = useState(false);
  const [viewMode, setViewMode] = useState<'split' | 'edit' | 'preview'>('split');

  useEffect(() => {
    setFrontmatter(doc.frontmatter || {});
    setContent(doc.content || '');
    setSaveStatus('idle');
    setDirty(false);
    onDirtyChange?.(false);
  }, [doc.relativePath]);

  // 快捷键 Ctrl+S 保存
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [frontmatter, content]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [dirty]);

  const handleSave = async () => {
    try {
      setSaving(true);
      await onSave({
        path: doc.relativePath,
        frontmatter,
        content,
      });
      setSaveStatus('saved');
      setDirty(false);
      onDirtyChange?.(false);
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  // 快捷插入辅助方法
  const insertSnippet = (snippet: string) => {
    setContent(prev => prev + '\n' + snippet + '\n');
  };

  // 实时渲染 Markdown 与 KaTeX
  const getRenderedHTML = () => {
    try {
      let parsed = marked.parse(content || '', { async: false }) as string;
      // 简单数学公式替换渲染
      parsed = parsed.replace(/\$\$([\s\S]+?)\$\$/g, (_, math) => {
        try {
          return katex.renderToString(math, { displayMode: true });
        } catch (e) {
          return `<span style="color:red">公式语法错误</span>`;
        }
      });
      parsed = parsed.replace(/\$([^\$\n]+?)\$/g, (_, math) => {
        try {
          return katex.renderToString(math, { displayMode: false });
        } catch (e) {
          return math;
        }
      });
      return parsed;
    } catch (e) {
      return '<p style="color:red">Markdown 语法渲染异常</p>';
    }
  };

  const wordCount = content.replace(/[\s\r\n]+/g, '').length;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* 顶部操作工具栏 */}
      <div style={{
        height: 50,
        padding: '0 16px',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'rgba(15, 23, 42, 0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>📄 {doc.filename}</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400 }}>
              ({doc.relativePath})
            </span>
            {dirty && <span className="badge badge-amber" style={{ fontSize: 11 }}>未保存</span>}
          </div>
          <span className="badge badge-blue" style={{ fontSize: 11 }}>
            {wordCount} 字符
          </span>
        </div>

        {/* 快捷插入与保存操作 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* 快捷格式工具按钮 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginRight: 8 }}>
            <button
              className="btn btn-secondary"
              style={{ padding: '4px 8px', fontSize: 12 }}
              onClick={() => insertSnippet('```c\n#include <stdio.h>\n\nint main() {\n    printf("Hello C\\n");\n    return 0;\n}\n```')}
              title="插入 C 语言代码块"
            >
              <Code size={13} />
              <span>代码</span>
            </button>
            <button
              className="btn btn-secondary"
              style={{ padding: '4px 8px', fontSize: 12 }}
              onClick={() => insertSnippet('| 考点 | 重要级别 | 备注 |\n| :--- | :---: | :--- |\n| 指针 | ★★★★★ | 必考核心 |')}
              title="插入表格"
            >
              <Table size={13} />
              <span>表格</span>
            </button>
            <button
              className="btn btn-secondary"
              style={{ padding: '4px 8px', fontSize: 12 }}
              onClick={() => insertSnippet(':::tip 备考重点\n请熟记指针数组与数组指针的区别。\n:::')}
              title="插入 Docusaurus 提示框"
            >
              <HelpCircle size={13} />
              <span>提示框</span>
            </button>
            <button
              className="btn btn-secondary"
              style={{ padding: '4px 8px', fontSize: 12 }}
              onClick={() => insertSnippet('$$ x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a} $$')}
              title="插入 LaTeX 公式"
            >
              <span>∑ 公式</span>
            </button>
          </div>

          {/* 视图切换 */}
          <div style={{ display: 'flex', background: 'rgba(30,41,59,0.7)', borderRadius: 'var(--radius-sm)', padding: 2 }}>
            <button
              style={{
                padding: '4px 8px',
                border: 'none',
                background: viewMode === 'split' ? 'var(--accent-primary)' : 'transparent',
                color: viewMode === 'split' ? '#fff' : 'var(--text-secondary)',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
              }}
              onClick={() => setViewMode('split')}
              title="分屏双模"
            >
              <Columns size={13} />
            </button>
            <button
              style={{
                padding: '4px 8px',
                border: 'none',
                background: viewMode === 'preview' ? 'var(--accent-primary)' : 'transparent',
                color: viewMode === 'preview' ? '#fff' : 'var(--text-secondary)',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
              }}
              onClick={() => setViewMode('preview')}
              title="纯预览"
            >
              <Eye size={13} />
            </button>
          </div>

          {/* 保存按钮 */}
          <button
            className="btn btn-primary"
            style={{ padding: '6px 14px', fontSize: 13 }}
            onClick={handleSave}
            disabled={saving}
          >
            <Save size={14} />
            <span>{saving ? '保存中...' : '保存修改'}</span>
          </button>

          {saveStatus === 'saved' && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--accent-emerald)', fontSize: 12 }}>
              <CheckCircle size={14} /> 已备份保存
            </span>
          )}
          {saveStatus === "error" && <span style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--accent-rose)", fontSize: 12 }}><AlertCircle size={14} /> 保存失败</span>}
        </div>
      </div>

      {/* Frontmatter 元数据编辑表单 */}
      <FrontmatterForm
        frontmatter={frontmatter}
        onChange={next => {
          setFrontmatter(next);
          setDirty(true);
          onDirtyChange?.(true);
        }}
      />

      {/* 编辑器主区域 */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* 编辑输入区 */}
        {(viewMode === 'split' || viewMode === 'edit') && (
          <div style={{
            flex: 1,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            borderRight: viewMode === 'split' ? '1px solid var(--border-subtle)' : 'none',
          }}>
            <textarea
              style={{
                flex: 1,
                width: '100%',
                background: '#090d16',
                color: '#f8fafc',
                padding: '20px',
                border: 'none',
                resize: 'none',
                outline: 'none',
                fontFamily: 'var(--font-mono)',
                fontSize: 14,
                lineHeight: 1.65,
              }}
              value={content}
              onChange={e => { setContent(e.target.value); setDirty(true); onDirtyChange?.(true); }}
              placeholder="编写 Markdown / MDX 笔记正文..."
              spellCheck={false}
            />
          </div>
        )}

        {/* 实时预览区 */}
        {(viewMode === 'split' || viewMode === 'preview') && (
          <div style={{
            flex: 1,
            height: '100%',
            overflowY: 'auto',
            padding: '24px 32px',
            background: 'rgba(15, 23, 42, 0.4)',
          }}>
            <div
              className="markdown-preview"
              dangerouslySetInnerHTML={{ __html: sanitizePreviewHtml(getRenderedHTML()) }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
