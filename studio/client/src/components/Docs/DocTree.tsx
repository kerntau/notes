import React, { useState } from 'react';
import {
  Folder,
  FolderOpen,
  FileText,
  Plus,
  Trash2,
  ChevronRight,
  ChevronDown,
  Search,
  FolderPlus,
  FilePlus,
} from 'lucide-react';
import { FileNode } from '../../types';

interface DocTreeProps {
  tree: FileNode[];
  selectedPath: string | null;
  onSelectDoc: (path: string) => void;
  onCreateDoc: (parentPath: string, isDirectory: boolean) => void;
  onDeleteDoc: (path: string) => void;
}

export const DocTree: React.FC<DocTreeProps> = ({
  tree,
  selectedPath,
  onSelectDoc,
  onCreateDoc,
  onDeleteDoc,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [collapsedDirs, setCollapsedDirs] = useState<Record<string, boolean>>({});

  const toggleCollapse = (path: string) => {
    setCollapsedDirs(prev => ({ ...prev, [path]: !prev[path] }));
  };

  const renderNode = (node: FileNode, level = 0) => {
    const isDir = node.isDirectory;
    const isSelected = selectedPath === node.relativePath;
    const isCollapsed = collapsedDirs[node.relativePath] ?? false;

    // 搜索过滤匹配
   if (searchTerm) {
     const matchSelf = node.name.toLowerCase().includes(searchTerm.toLowerCase()) || (node.title && node.title.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesDescendant = (children: FileNode[] = []): boolean => children.some(child => {
        const matchesSelf = child.name.toLowerCase().includes(searchTerm.toLowerCase()) || Boolean(child.title?.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesSelf || (child.isDirectory && matchesDescendant(child.children));
      });
      const matchChildren = isDir && matchesDescendant(node.children);
     if (!matchSelf && !matchChildren) return null;
   }

    return (
      <div key={node.relativePath} style={{ marginLeft: level * 12 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '6px 8px',
            borderRadius: 'var(--radius-sm)',
            background: isSelected ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
            color: isSelected ? 'var(--accent-primary)' : 'var(--text-secondary)',
            cursor: 'pointer',
            fontSize: 13,
            marginBottom: 2,
            transition: 'background 0.1s ease',
          }}
          onClick={() => {
            if (isDir) {
              toggleCollapse(node.relativePath);
            } else {
              onSelectDoc(node.relativePath);
            }
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {isDir ? (
              <>
                {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                {isCollapsed ? <Folder size={15} color="var(--accent-amber)" /> : <FolderOpen size={15} color="var(--accent-amber)" />}
                <span style={{ fontWeight: 500 }}>{node.name}</span>
              </>
            ) : (
              <>
                <FileText size={14} color="var(--accent-primary)" style={{ flexShrink: 0 }} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {node.title || node.name}
                </span>
                {node.sidebarPosition !== undefined && (
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>#{node.sidebarPosition}</span>
                )}
              </>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} onClick={e => e.stopPropagation()}>
            {isDir && (
              <>
                <button
                  className="btn btn-secondary"
                  style={{ padding: '2px 4px', fontSize: 10 }}
                  onClick={() => onCreateDoc(node.relativePath, false)}
                  title="新建文档"
                >
                  <FilePlus size={12} />
                </button>
                <button
                  className="btn btn-secondary"
                  style={{ padding: '2px 4px', fontSize: 10 }}
                  onClick={() => onCreateDoc(node.relativePath, true)}
                  title="新建子目录"
                >
                  <FolderPlus size={12} />
                </button>
              </>
            )}
            {node.relativePath !== 'docs' && node.relativePath !== 'blog' && (
              <button
                className="btn btn-danger"
                style={{ padding: '2px 4px', fontSize: 10 }}
                onClick={() => onDeleteDoc(node.relativePath)}
                title="删除"
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
        </div>

        {isDir && !isCollapsed && node.children && (
          <div>
            {node.children.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{
      width: 280,
      background: 'rgba(15, 23, 42, 0.6)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      flexShrink: 0,
    }}>
      {/* 搜索与全局新建栏 */}
      <div style={{ padding: '12px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="input-field"
            placeholder="搜索文档/标题..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ paddingLeft: 30, fontSize: 13 }}
          />
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          <button
            className="btn btn-primary"
            style={{ flex: 1, padding: '6px 8px', fontSize: 12 }}
            onClick={() => onCreateDoc('docs', false)}
          >
            <Plus size={13} />
            <span>新建笔记</span>
          </button>
          <button
            className="btn btn-secondary"
            style={{ padding: '6px 8px', fontSize: 12 }}
            onClick={() => onCreateDoc('docs', true)}
            title="新建顶层目录"
          >
            <FolderPlus size={13} />
          </button>
        </div>
      </div>

      {/* 目录树列表 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 8px' }}>
        {tree.map(node => renderNode(node))}
      </div>
    </div>
  );
};
