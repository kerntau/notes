import React, { useState, useEffect } from 'react';
import {
  GitBranch,
  GitCommit,
  CheckSquare,
  Square,
  FileCode,
  CheckCircle2,
  RefreshCw,
  Eye,
  Send,
} from 'lucide-react';
import { api } from '../../services/api';
import { GitRepoStatus, GitFileStatus } from '../../types';

export const GitView: React.FC = () => {
  const [gitStatus, setGitStatus] = useState<GitRepoStatus | null>(null);
 const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFileDiff, setSelectedFileDiff] = useState<{ file: string; diff: string } | null>(null);

  // Commit 表单状态
  const [type, setType] = useState('docs');
  const [scope, setScope] = useState('notes');
  const [subject, setSubject] = useState('');
  const [background, setBackground] = useState('');
  const [problem, setProblem] = useState('');
  const [solution, setSolution] = useState('');
  const [impact, setImpact] = useState('');
  const [risk, setRisk] = useState('无破坏性变更，保持向后兼容');

  const [committing, setCommitting] = useState(false);
  const [commitResult, setCommitResult] = useState<string | null>(null);
  const [actionFile, setActionFile] = useState<string | null>(null);

  const loadGitStatus = async () => {
   try {
     setLoading(true);
      setError(null);
     const res = await api.getGitStatus();
     setGitStatus(res);
   } catch (e) {
      setError(e instanceof Error ? e.message : '获取 Git 状态失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGitStatus();
    const timer = window.setInterval(loadGitStatus, 30000);
    return () => window.clearInterval(timer);
  }, []);

  const handleToggleStage = async (file: string, currentStaged: boolean) => {
    try {
      setActionFile(file);
      await api.stageGitFile(file, !currentStaged);
      await loadGitStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : '暂存操作失败');
    } finally {
      setActionFile(null);
    }
  };

  const handleViewDiff = async (file: string) => {
    try {
      setActionFile(file);
      const res = await api.getGitDiff(file);
      setSelectedFileDiff({ file, diff: res.diff || '（暂无未暂存文本差异）' });
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取 Diff 失败');
    } finally {
      setActionFile(null);
    }
  };

  const handleCommit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) {
      setError('请填写提交说明 (subject)');
      return;
    }

    const body = `[背景]\n${background || '更新学习知识库内容与备考笔记'}\n\n[问题]\n${problem || '优化笔记排版与完善考点总结'}\n\n[方案]\n${solution || subject}\n\n[影响]\n${impact || '仅影响相关文档与配置文件'}\n\n[风险]\n${risk || '无'}`;

    try {
      setCommitting(true);
      setError(null);
      const res = await api.commitGit({
        type,
        scope,
        subject: subject.trim(),
        body,
      });
      setCommitResult(res.message || '提交成功');
      setSubject('');
      await loadGitStatus();
      setTimeout(() => setCommitResult(null), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Git 提交失败');
    } finally {
      setCommitting(false);
    }
  };

  const stagedFiles = gitStatus?.files.filter(f => f.staged) || [];
  const unstagedFiles = gitStatus?.files.filter(f => !f.staged) || [];

  return (
   <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20, height: '100%' }}>
      {error && <div className="studio-inline-error" role="alert"><span>{error}</span><button type="button" className="btn btn-secondary" onClick={() => setError(null)}>关闭</button></div>}
      {/* 左侧：变更文件列表与 Diff 视图 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto' }}>
        {/* 顶部分支与状态信息 */}
        <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <GitBranch size={20} color="var(--accent-primary)" />
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>
                当前分支: <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)' }}>{gitStatus?.currentBranch}</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {gitStatus?.isClean ? '工作区干净，无未提交修改' : `共 ${gitStatus?.files.length || 0} 个变更文件`}
              </div>
            </div>
          </div>

          <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: 12 }} onClick={loadGitStatus}>
            <RefreshCw size={13} />
            <span>刷新状态</span>
          </button>
        </div>

        {/* 文件变动列表 */}
        <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* 已暂存列表 (Staged) */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent-emerald)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>已暂存变更 (Staged Changes) - {stagedFiles.length}</span>
            </div>
            {stagedFiles.length === 0 ? (
              <div style={{ fontSize: 12, color: 'var(--text-muted)', padding: '6px 0' }}>暂无暂存文件，请在下方勾选需提交的文件</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {stagedFiles.map(f => (
                  <div key={f.path} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 10px',
                    background: 'rgba(16, 185, 129, 0.08)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 13,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <button
                        onClick={() => handleToggleStage(f.path, true)}
                        disabled={actionFile === f.path}
                        style={{ background: 'transparent', border: 'none', color: 'var(--accent-emerald)', cursor: 'pointer' }}
                        title="取消暂存"
                      >
                        <CheckSquare size={16} />
                      </button>
                      <span style={{ fontFamily: 'var(--font-mono)' }}>{f.path}</span>
                    </div>
                    <span className="badge badge-green" style={{ fontSize: 10 }}>{f.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 未暂存列表 (Unstaged) */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent-amber)', marginBottom: 8 }}>
              未暂存文件 (Unstaged Changes) - {unstagedFiles.length}
            </div>
            {unstagedFiles.length === 0 ? (
              <div style={{ fontSize: 12, color: 'var(--text-muted)', padding: '6px 0' }}>无未暂存文件</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {unstagedFiles.map(f => (
                  <div key={f.path} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 10px',
                    background: 'rgba(15, 23, 42, 0.5)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 13,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <button
                        onClick={() => handleToggleStage(f.path, false)}
                        disabled={actionFile === f.path}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                        title="点击暂存该文件"
                      >
                        <Square size={16} />
                      </button>
                      <span style={{ fontFamily: 'var(--font-mono)' }}>{f.path}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '2px 6px', fontSize: 11 }}
                        onClick={() => handleViewDiff(f.path)}
                        disabled={actionFile === f.path}
                      >
                        <Eye size={12} />
                        <span>Diff</span>
                      </button>
                      <span className="badge badge-amber" style={{ fontSize: 10 }}>{f.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Diff 差异展示区 */}
        {selectedFileDiff && (
          <div className="glass-card" style={{ padding: '16px', background: '#090d16' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}>
                Diff: {selectedFileDiff.file}
              </div>
              <button
                className="btn btn-secondary"
                style={{ padding: '2px 6px', fontSize: 11 }}
                onClick={() => setSelectedFileDiff(null)}
              >
                关闭
              </button>
            </div>
            <pre style={{
              fontSize: 12,
              fontFamily: 'var(--font-mono)',
              lineHeight: 1.5,
              color: '#e2e8f0',
              overflowX: 'auto',
              maxHeight: 200,
            }}>
              {selectedFileDiff.diff}
            </pre>
          </div>
        )}
      </div>

      {/* 右侧：规范化 Commit Message 提交表单 */}
      <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <GitCommit size={20} color="var(--accent-primary)" />
          <h3 style={{ fontSize: 16, fontWeight: 600 }}>规范化原子 Commit 提交助手</h3>
        </div>

        <form onSubmit={handleCommit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Commit Type & Scope */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
                提交类型 (Type)
              </label>
              <select
                className="input-field"
                value={type}
                onChange={e => setType(e.target.value)}
              >
                <option value="docs">docs (文档与笔记更新)</option>
                <option value="feat">feat (新增功能与配置)</option>
                <option value="fix">fix (修复内容或坏链)</option>
                <option value="style">style (排版与格式微调)</option>
                <option value="refactor">refactor (重构代码/目录)</option>
                <option value="chore">chore (构建/依赖调整)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
                作用域 (Scope)
              </label>
              <input
                type="text"
                className="input-field"
                value={scope}
                onChange={e => setScope(e.target.value)}
                placeholder="如: c-lang, exam, config"
                required
              />
            </div>
          </div>

          {/* Subject */}
          <div>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
              提交简述 (Subject - 动词开头, 50字以内)
            </label>
            <input
              type="text"
              className="input-field"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="如: 新增指针与结构体重点笔记"
              required
            />
          </div>

          {/* 详细规范 Body */}
          <div>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
              [背景] 为什么修改:
            </label>
            <input
              type="text"
              className="input-field"
              value={background}
              onChange={e => setBackground(e.target.value)}
              placeholder="如: 专升本备考复习进度推进"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
              [方案] 采用的核心方案:
            </label>
            <input
              type="text"
              className="input-field"
              value={solution}
              onChange={e => setSolution(e.target.value)}
              placeholder="如: 补充 C 语言指针真题与详细题解"
            />
          </div>

          {/* 实时 Commit 预览 */}
          <div style={{ padding: '10px 12px', background: '#090d16', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>生成的 Commit Message 预览:</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent-primary)' }}>
              {type}({scope}): {subject || '...'}
            </div>
          </div>

          {commitResult && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--accent-emerald)', fontSize: 13 }}>
              <CheckCircle2 size={16} /> <span>{commitResult}</span>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={committing || stagedFiles.length === 0}
            style={{ marginTop: 8 }}
          >
            <Send size={15} />
            <span>{committing ? '正在提交...' : `执行原子 Commit (${stagedFiles.length} 个暂存文件)`}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
