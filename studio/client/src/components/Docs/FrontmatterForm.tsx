import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Tag, Layers, FileCode } from 'lucide-react';

interface FrontmatterFormProps {
  frontmatter: Record<string, any>;
  onChange: (fm: Record<string, any>) => void;
}

export const FrontmatterForm: React.FC<FrontmatterFormProps> = ({ frontmatter, onChange }) => {
  const [expanded, setExpanded] = useState(true);

  const updateField = (key: string, value: any) => {
    onChange({
      ...frontmatter,
      [key]: value,
    });
  };

  const handleTagsChange = (val: string) => {
    const tags = val
      .split(/[,， ]+/)
      .map(t => t.trim())
      .filter(Boolean);
    updateField('tags', tags);
  };

  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.75)',
      borderBottom: '1px solid var(--border-subtle)',
      padding: '10px 16px',
    }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          userSelect: 'none',
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
          <Layers size={15} color="var(--accent-primary)" />
          <span>元数据与 Frontmatter 配置</span>
          {frontmatter.title && (
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 400 }}>
              ({frontmatter.title})
            </span>
          )}
        </div>
        <button className="btn btn-secondary" style={{ padding: '2px 6px', fontSize: 11 }}>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {expanded && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 12,
          marginTop: 12,
          paddingTop: 10,
          borderTop: '1px dashed var(--border-subtle)',
        }}>
          {/* 文档标题 */}
          <div>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
              文章标题 (title)
            </label>
            <input
              type="text"
              className="input-field"
              value={frontmatter.title || ''}
              onChange={e => updateField('title', e.target.value)}
              placeholder="请输入文档标题"
            />
          </div>

          {/* 侧栏序号 */}
          <div>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
              侧栏排序权重 (sidebar_position)
            </label>
            <input
              type="number"
              className="input-field"
              value={frontmatter.sidebar_position ?? ''}
              onChange={e => updateField('sidebar_position', e.target.value ? Number(e.target.value) : undefined)}
              placeholder="如: 1, 2, 3..."
            />
          </div>

          {/* 标签 */}
          <div>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
              标签 tags (逗号分隔)
            </label>
            <input
              type="text"
              className="input-field"
              value={Array.isArray(frontmatter.tags) ? frontmatter.tags.join(', ') : ''}
              onChange={e => handleTagsChange(e.target.value)}
              placeholder="如: C语言, 指针, 专升本"
            />
          </div>

          {/* 描述 Description */}
          <div>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
              摘要描述 (description)
            </label>
            <input
              type="text"
              className="input-field"
              value={frontmatter.description || ''}
              onChange={e => updateField('description', e.target.value)}
              placeholder="SEO 摘要与搜索关键词"
            />
          </div>
        </div>
      )}
    </div>
  );
};
