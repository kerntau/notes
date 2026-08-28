import React, { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle, Clock, Megaphone, Globe } from 'lucide-react';
import { api } from '../../services/api';
import { SiteConfig } from '../../types';

export const ConfigView: React.FC = () => {
  const [config, setConfig] = useState<SiteConfig>({
    title: '序记',
    tagline: '个人知识库与博客记录',
    announcement: { enabled: true, content: '🎉 欢迎莅临小站 🥳' },
    examDate: '2027-04-17T09:00:00+08:00',
  });
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    const refresh = () => {
      if (dirty) return;
      setLoading(true);
      api.getSiteConfig().then(setConfig).catch(err => setError(err instanceof Error ? err.message : "读取站点配置失败")).finally(() => setLoading(false));
    };
    refresh();
    const timer = window.setInterval(() => {
      refresh();
    }, 60000);
    return () => window.clearInterval(timer);
  }, [dirty]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const examTimestamp = Date.parse(config.examDate);
    if (!Number.isFinite(examTimestamp)) {
      setError("考试时间格式无效，请使用 YYYY-MM-DDTHH:mm:ss+08:00 格式");
      return;
    }
    try {
      setSaving(true);
      setError(null);
      await api.updateSiteConfig(config);
      setDirty(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存配置失败");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {error && <div className="studio-inline-error" role="alert"><span>{error}</span><button type="button" className="btn btn-secondary" onClick={() => setError(null)}>关闭</button></div>}
      {loading && <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>正在读取站点配置…</div>}
      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* 1. 备考倒计时中枢配置 */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <Clock size={20} color="var(--accent-amber)" />
            <h3 style={{ fontSize: 16, fontWeight: 600 }}>专升本备考倒计时中枢配置</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>
                目标考试时间 (精确对齐首页天/时/分/秒动态倒计时)
              </label>
              <input
                type="text"
                className="input-field"
                value={config.examDate}
                onChange={e => { setConfig(prev => ({ ...prev, examDate: e.target.value })); setDirty(true); }}
                placeholder="2027-04-17T09:00:00+08:00"
                required
              />
              <span style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                格式示例: 2027-04-17T09:00:00+08:00
              </span>
            </div>
          </div>
        </div>

        {/* 2. 顶部全局公告栏配置 */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <Megaphone size={20} color="var(--accent-primary)" />
            <h3 style={{ fontSize: 16, fontWeight: 600 }}>全站顶部公告栏 (Announcement Bar)</h3>
          </div>
         <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={config.announcement.enabled}
                onChange={e => {
                  setConfig(prev => ({ ...prev, announcement: { ...prev.announcement, enabled: e.target.checked } }));
                  setDirty(true);
                }}
              />
              <span>{config.announcement.enabled ? '公告栏已启用' : '公告栏已关闭'}</span>
            </label>
           <div>
             <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>
               公告富文本内容 (支持 Emoji 与 HTML 链接)
              </label>
              <input
                type="text"
                className="input-field"
                value={config.announcement.content}
                onChange={e => {
                  setConfig(prev => ({
                    ...prev,
                    announcement: { ...prev.announcement, content: e.target.value },
                  }));
                  setDirty(true);
                }}
                placeholder="如: 🎉 欢迎莅临小站 🥳"
                required
              />
            </div>
          </div>
        </div>

        {/* 3. 站点基本元数据 */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <Globe size={20} color="var(--accent-emerald)" />
            <h3 style={{ fontSize: 16, fontWeight: 600 }}>站点元数据与标题</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>
                站点主标题 (Title)
              </label>
              <input
                type="text"
                className="input-field"
                value={config.title}
                onChange={e => { setConfig(prev => ({ ...prev, title: e.target.value })); setDirty(true); }}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>
                副标题标语 (Tagline)
              </label>
              <input
                type="text"
                className="input-field"
                value={config.tagline}
                onChange={e => { setConfig(prev => ({ ...prev, tagline: e.target.value })); setDirty(true); }}
                required
              />
            </div>
          </div>
        </div>

        {/* 保存按钮与状态提示 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12 }}>
          {saveSuccess && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--accent-emerald)', fontSize: 13 }}>
              <CheckCircle size={16} /> 站点配置与倒计时已成功持久化更新！
            </span>
          )}
          <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px', fontSize: 14 }} disabled={saving}>
            <Save size={16} />
            <span>{saving ? '保存中...' : '保存全局配置'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
