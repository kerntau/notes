import React, { useState, useEffect, useRef } from 'react';
import {
  UploadCloud,
  Trash2,
  Copy,
  Check,
  Search,
  AlertOctagon,
  Image as ImageIcon,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { api } from '../../services/api';
import { ImageItem } from '../../types';

export const MediaView: React.FC = () => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingPath, setDeletingPath] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [orphanData, setOrphanData] = useState<{ totalImages: number; orphansCount: number; orphans: ImageItem[] } | null>(null);
  const [showOrphansOnly, setShowOrphansOnly] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const loadMedia = async () => {
    try {
      setLoading(true);
      setError(null);
      const [list, orphans] = await Promise.all([
        api.getMediaList(),
        api.getOrphanMedia(),
      ]);
      setImages(list);
      setOrphanData(orphans);
    } catch (e) {
      setError(e instanceof Error ? e.message : '加载媒体库失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
    const timer = window.setInterval(loadMedia, 60000);
    return () => window.clearInterval(timer);
  }, []);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    try {
      setUploading(true);
      await api.uploadMedia(Array.from(files));
      await loadMedia();
    } catch (err) {
      setError(err instanceof Error ? err.message : '上传失败');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      handleUpload(e.dataTransfer.files);
    }
  };

  const copyMarkdown = (relPath: string) => {
    const text = `![](${relPath})`;
    navigator.clipboard.writeText(text);
    setCopiedPath(relPath);
    setTimeout(() => setCopiedPath(null), 2000);
  };

  const handleDelete = async (relPath: string) => {
    if (confirm(`确认要删除素材 [${relPath}] 吗？`)) {
    try {
        setDeletingPath(relPath);
        await api.deleteMedia(relPath);
        await loadMedia();
      } catch (err) {
        setError(err instanceof Error ? err.message : '删除失败');
      } finally {
        setDeletingPath(null);
      }
    }
  };

  const displayList = (showOrphansOnly ? (orphanData?.orphans || []) : images).filter(img =>
    img.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {error && <div className="studio-inline-error" role="alert"><span>{error}</span><button type="button" className="btn btn-secondary" onClick={loadMedia}>重试</button></div>}
      {/* 顶部操作区与拖拽上传 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16 }}>
        {/* 拖拽上传框 */}
        <div
          className="glass-card"
          onDragOver={e => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            padding: '24px',
            border: '2px dashed var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            background: 'rgba(15, 23, 42, 0.4)',
            transition: 'all 0.2s ease',
          }}
        >
          <input
            type="file"
            multiple
            accept="image/*"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={e => handleUpload(e.target.files)}
          />
          <UploadCloud size={36} color="var(--accent-primary)" style={{ marginBottom: 8 }} />
          <div style={{ fontSize: 14, fontWeight: 600 }}>
            {uploading ? '正在上传图片中...' : '点击选择或拖拽图片至此处上传'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            支持 PNG, JPG, GIF, WebP, SVG (自动归档至 static/img/)
          </div>
        </div>

        {/* 孤儿资源排查卡片 */}
        <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <AlertOctagon size={18} color="var(--accent-amber)" />
              <h4 style={{ fontSize: 15, fontWeight: 600 }}>孤儿图片排查器</h4>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              自动扫描全站 Markdown 笔记，检测未被任何文档引用的无用冗余图片。
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
            <span style={{ fontSize: 13 }}>
              孤儿图片数: <strong style={{ color: orphanData?.orphansCount ? 'var(--accent-rose)' : 'var(--accent-emerald)' }}>{orphanData?.orphansCount || 0}</strong>
            </span>
            <button
              className={`btn ${showOrphansOnly ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '4px 10px', fontSize: 12 }}
              onClick={() => setShowOrphansOnly(!showOrphansOnly)}
            >
              {showOrphansOnly ? '显示全部图片' : '仅看未引用图片'}
            </button>
          </div>
        </div>
      </div>

      {/* 搜索与过滤工具栏 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ position: 'relative', width: 300 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="input-field"
            placeholder="搜索图片素材名称..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ paddingLeft: 30, fontSize: 13 }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            共 {displayList.length} 张图片
          </span>
          <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: 12 }} onClick={loadMedia}>
            <RefreshCw size={13} />
          </button>
        </div>
      </div>

      {/* 图片素材瀑布流/网格 */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>加载素材中...</div>
      ) : displayList.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
          <ImageIcon size={40} style={{ margin: '0 auto 12px auto', opacity: 0.3 }} />
          <div>暂无匹配图片素材</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
          {displayList.map(img => {
            const isOrphan = orphanData?.orphans.some(o => o.name === img.name);
            const isCopied = copiedPath === img.relativePath;

            return (
              <div key={img.relativePath} className="glass-card" style={{
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                border: isOrphan ? '1px solid rgba(244, 63, 94, 0.4)' : undefined,
              }}>
                {/* 图片缩略图 */}
                <div style={{
                  height: 140,
                  background: '#090d16',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  position: 'relative',
                }}>
                  <img
                    src={img.relativePath}
                    alt={img.name}
                    style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                    loading="lazy"
                  />
                  {isOrphan && (
                    <span className="badge badge-rose" style={{ position: 'absolute', top: 6, left: 6, fontSize: 10 }}>
                      未引用
                    </span>
                  )}
                </div>

                {/* 图片信息与操作 */}
                <div style={{ padding: '10px 12px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={img.name}>
                      {img.name}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                      {(img.sizeBytes / 1024).toFixed(1)} KB
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                    <button
                      className="btn btn-secondary"
                      style={{ flex: 1, padding: '4px 6px', fontSize: 11 }}
                      onClick={() => copyMarkdown(img.relativePath)}
                      title="复制 Markdown 引用语法"
                    >
                      {isCopied ? <Check size={12} color="var(--accent-emerald)" /> : <Copy size={12} />}
                      <span>{isCopied ? '已复制' : '复制语法'}</span>
                    </button>
                    <button
                      className="btn btn-danger"
                      style={{ padding: '4px 6px', fontSize: 11 }}
                      onClick={() => handleDelete(img.relativePath)}
                      disabled={deletingPath === img.relativePath}
                      title="删除图片"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
