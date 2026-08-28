import React, { useState, useEffect } from 'react';
import { DocTree } from './DocTree';
import { DocEditor } from './DocEditor';
import { api } from '../../services/api';
import { FileNode, DocDetail } from '../../types';
import { BookOpen, Plus, FolderPlus, Sparkles } from 'lucide-react';

export const DocsView: React.FC = () => {
  const [tree, setTree] = useState<FileNode[]>([]);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [currentDoc, setCurrentDoc] = useState<DocDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [deletingPath, setDeletingPath] = useState<string | null>(null);
  const [editorDirty, setEditorDirty] = useState(false);

  // 弹窗状态
  const [createModal, setCreateModal] = useState<{
    open: boolean;
    parentPath: string;
    isDirectory: boolean;
    name: string;
    initialTitle: string;
  }>({
    open: false,
    parentPath: 'docs',
    isDirectory: false,
    name: '',
    initialTitle: '',
  });

  const loadTree = async (autoSelectFirst = false) => {
    try {
      setError(null);
      const data = await api.getDocsTree();
      setTree(data);

      if (autoSelectFirst && !selectedPath && data.length > 0) {
        // 查找第一个有效文档
        const findFirstDoc = (nodes: FileNode[]): string | null => {
          for (const n of nodes) {
            if (!n.isDirectory) return n.relativePath;
            if (n.children) {
              const sub = findFirstDoc(n.children);
              if (sub) return sub;
            }
          }
          return null;
        };
        const first = findFirstDoc(data);
        if (first) {
          handleSelectDoc(first);
        }
      }
    } catch (e) {
      console.error('加载目录树失败:', e);
      setError(e instanceof Error ? e.message : '加载目录树失败');
    }
  };

  useEffect(() => {
    loadTree(true);
  }, []);

  const handleSelectDoc = async (path: string) => {
    if (editorDirty && path !== selectedPath && !confirm('当前文档有未保存修改，确定放弃并切换吗？')) return;
    try {
      setLoading(true);
      setError(null);
      setSelectedPath(path);
      const detail = await api.getDocDetail(path);
      setCurrentDoc(detail);
    } catch (err) {
      setCurrentDoc(null);
      setError(err instanceof Error ? err.message : '读取文档失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDoc = async (docData: { path: string; frontmatter: Record<string, any>; content: string }) => {
    await api.saveDoc(docData);
    // 刷新目录树以同步标题/排序
    loadTree(false);
  };

  const handleOpenCreate = (parentPath: string, isDirectory: boolean) => {
    setCreateModal({
      open: true,
      parentPath,
      isDirectory,
      name: '',
      initialTitle: '',
    });
  };

  const handleConfirmCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createModal.name.trim()) return;

    try {
      setCreating(true);
      const res = await api.createDoc({
        parentPath: createModal.parentPath,
        name: createModal.name.trim(),
        isDirectory: createModal.isDirectory,
        initialTitle: createModal.initialTitle.trim() || undefined,
      });

      setCreateModal(prev => ({ ...prev, open: false }));
      await loadTree(false);

      if (!createModal.isDirectory && res.relativePath) {
        handleSelectDoc(res.relativePath);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建失败');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteDoc = async (path: string) => {
    if (confirm(`确认要删除 [${path}] 吗？后台会自动保留快照备份。`)) {
      try {
        setDeletingPath(path);
        await api.deleteDoc(path);
        if (selectedPath === path) {
          setSelectedPath(null);
          setCurrentDoc(null);
        }
        loadTree(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : '删除失败');
      } finally {
        setDeletingPath(null);
      }
    }
  };

  return (
    <div style={{ display: 'flex', height: '100%', width: '100%', overflow: 'hidden' }}>
      {error && (
        <div className="studio-inline-error" role="alert">
          <span>{error}</span>
          <button type="button" className="btn btn-secondary" onClick={() => loadTree(false)}>重试</button>
        </div>
      )}
      {/* 目录树导航 */}
      <DocTree
        tree={tree}
        selectedPath={selectedPath}
        onSelectDoc={handleSelectDoc}
        onCreateDoc={handleOpenCreate}
        onDeleteDoc={handleDeleteDoc}
      />

      {/* 编辑器主区 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            <span>加载文档中...</span>
          </div>
        ) : currentDoc ? (
          <DocEditor doc={currentDoc} onSave={handleSaveDoc} onDirtyChange={setEditorDirty} />
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            <BookOpen size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
            <h3 style={{ fontSize: 16, color: 'var(--text-secondary)' }}>请选择或新建一篇学习笔记开始编辑</h3>
            <p style={{ fontSize: 13, marginTop: 4 }}>支持分屏实时预览、KaTeX 公式与 Frontmatter 可视化配置</p>
          </div>
        )}
      </div>

      {/* 新建模态框 */}
      {createModal.open && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
        }}>
          <div className="glass-card" style={{ width: 440, padding: 24, background: '#1e293b' }}>
            <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              {createModal.isDirectory ? <FolderPlus size={18} color="var(--accent-amber)" /> : <Plus size={18} color="var(--accent-primary)" />}
              <span>新建 {createModal.isDirectory ? '分类目录' : '笔记文档'}</span>
            </h3>

            <form onSubmit={handleConfirmCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
                  父级目录:
                </label>
                <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)' }}>
                  {createModal.parentPath}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
                  {createModal.isDirectory ? '目录名称' : '文件标识名称 (英文或拼音)'}
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder={createModal.isDirectory ? '如: 06-pointers' : '如: pointer-arithmetic.md'}
                  value={createModal.name}
                  onChange={e => setCreateModal(prev => ({ ...prev, name: e.target.value }))}
                  autoFocus
                  required
                />
              </div>

              {!createModal.isDirectory && (
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
                    笔记标题 (title)
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="如: 指针运算与数组引用详解"
                    value={createModal.initialTitle}
                    onChange={e => setCreateModal(prev => ({ ...prev, initialTitle: e.target.value }))}
                  />
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setCreateModal(prev => ({ ...prev, open: false }))}
                >
                  取消
                </button>
                <button type="submit" className="btn btn-primary" disabled={creating}>
                  {creating ? '创建中...' : '确认创建'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
