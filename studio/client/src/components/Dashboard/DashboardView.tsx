import React, { useEffect, useState } from 'react';
import {
  FileText,
  Type,
  AlertTriangle,
  CheckCircle2,
  Clock,
  GitCommit,
  Sparkles,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { api } from '../../services/api';
import { StatsOverview, HealthIssue, SiteConfig } from '../../types';

interface DashboardViewProps {
  onNavigate: (tab: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<StatsOverview | null>(null);
  const [health, setHealth] = useState<{ totalIssues: number; issues: HealthIssue[] }>({ totalIssues: 0, issues: [] });
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [s, h, c] = await Promise.all([
        api.getStatsOverview(),
        api.getHealthIssues(),
        api.getSiteConfig(),
      ]);
      setStats(s);
      setHealth(h);
      setSiteConfig(c);
    } catch (e) {
      console.error('加载大盘数据失败:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 计算倒计时剩余天数
  let countdownDays = 0;
  if (siteConfig?.examDate) {
    const diff = new Date(siteConfig.examDate).getTime() - new Date().getTime();
    countdownDays = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* 顶部欢迎卡片 */}
      <div className="glass-card" style={{
        padding: '24px 28px',
        background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.15) 0%, rgba(15, 23, 42, 0.7) 100%)',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Sparkles size={20} color="var(--accent-primary)" />
            <h2 style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-display)' }}>
              {siteConfig?.title || '序记®'} 内容管理工作台
            </h2>
            <span className="badge badge-blue">Local Studio</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            {siteConfig?.tagline || '专升本备考笔记与极简学习知识库'} · 当前距离专升本备考目标仅剩{' '}
            <strong style={{ color: 'var(--accent-primary)', fontSize: 16 }}>{countdownDays}</strong> 天
          </p>
        </div>
        <button
          className="btn btn-secondary"
          onClick={loadData}
          disabled={loading}
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          <span>刷新数据</span>
        </button>
      </div>

      {/* 核心指标 4 宫格 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: 8 }}>
            <span style={{ fontSize: 13 }}>总字数统计 (CJK+ENG)</span>
            <Type size={18} color="var(--accent-primary)" />
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
            {stats?.totalWords ? stats.totalWords.toLocaleString() : '0'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            中文: {stats?.totalCJK?.toLocaleString() || 0} 字 | 英文: {stats?.totalEng?.toLocaleString() || 0} 词
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: 8 }}>
            <span style={{ fontSize: 13 }}>文档与笔记总数</span>
            <FileText size={18} color="var(--accent-emerald)" />
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
            {stats?.docsCount || 0} <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--text-muted)' }}>篇</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            含 C语言笔记 与 历年试题
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: 8 }}>
            <span style={{ fontSize: 13 }}>备考倒计时中枢</span>
            <Clock size={18} color="var(--accent-amber)" />
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent-amber)' }}>
            {countdownDays} <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--text-muted)' }}>天</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            目标考期: {siteConfig?.examDate?.split('T')[0] || '2027-04-17'}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: 8 }}>
            <span style={{ fontSize: 13 }}>健康诊断情况</span>
            {health.totalIssues === 0 ? (
              <CheckCircle2 size={18} color="var(--accent-emerald)" />
            ) : (
              <AlertTriangle size={18} color="var(--accent-rose)" />
            )}
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, fontFamily: 'var(--font-mono)', color: health.totalIssues === 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
            {health.totalIssues} <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--text-muted)' }}>项问题</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            {health.totalIssues === 0 ? '全站链接与结构完全正常' : '发现潜在坏链或缺失属性'}
          </div>
        </div>
      </div>

      {/* 分类字数统计与健康诊断两列 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 20 }}>
        {/* 分类分布 */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>📚 知识库各板块统计</span>
            <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => onNavigate('docs')}>
              <span>前往管理</span>
              <ArrowRight size={12} />
            </button>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {stats?.categories && Object.entries(stats.categories).map(([cat, info]) => (
              <div key={cat} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                background: 'rgba(15, 23, 42, 0.5)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
              }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{cat}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>包含 {info.count} 篇文档</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)' }}>
                    {info.words.toLocaleString()} 字
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 健康诊断列表与 Git 摘要 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* 健康检测列表 */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 14 }}>
              🩺 知识库健康诊断
            </h3>
            {health.issues.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--accent-emerald)', fontSize: 14 }}>
                <CheckCircle2 size={32} style={{ margin: '0 auto 8px auto', display: 'block' }} />
                <span>太棒了！所有 Markdown 文档、内链与静态素材均完好无损。</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 200, overflowY: 'auto' }}>
                {health.issues.map((issue, idx) => (
                  <div key={idx} style={{
                    padding: '8px 12px',
                    background: 'rgba(244, 63, 94, 0.08)',
                    borderLeft: '3px solid var(--accent-rose)',
                    borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
                    fontSize: 13,
                  }}>
                    <div style={{ fontWeight: 500, color: '#f87171' }}>{issue.file}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{issue.message} {issue.target ? `[${issue.target}]` : ''}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Git 最新提交摘要 */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <GitCommit size={16} color="var(--accent-primary)" />
              <span>当前 Git 版本与提交信息</span>
            </h3>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>最新版本：</span>
                <span className="badge badge-blue" style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{stats?.appVersion || 'v1.0.0'}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Commit Hash：</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>{stats?.gitCommit || 'latest'}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>提交说明：</span>
                <span>{stats?.gitMsg || '初始提交'}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>提交作者与时间：</span>
                <span>{stats?.gitAuthor} ({stats?.gitDate})</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
