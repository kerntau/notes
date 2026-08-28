import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  Image as ImageIcon,
  Settings,
  Terminal,
  GitBranch,
  BookMarked,
  LucideIcon,
} from 'lucide-react';

export type TabType = 'dashboard' | 'docs' | 'media' | 'config' | 'devops' | 'git';

interface NavItem {
  id: TabType;
  label: string;
  icon: LucideIcon;
  badge?: string;
  badgeColor?: string;
}

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  devRunning: boolean;
  gitModifiedCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  devRunning,
  gitModifiedCount,
}) => {
  const navItems: NavItem[] = [
    { id: 'dashboard', label: '大盘概览', icon: LayoutDashboard },
    { id: 'docs', label: '知识库管理', icon: BookOpen },
    { id: 'media', label: '媒体素材库', icon: ImageIcon },
    { id: 'config', label: '站点与倒计时', icon: Settings },
    {
      id: 'devops',
      label: 'DevOps 控制台',
      icon: Terminal,
      badge: devRunning ? 'RUNNING' : undefined,
      badgeColor: 'badge-green',
    },
    {
      id: 'git',
      label: 'Git 提交助手',
      icon: GitBranch,
      badge: gitModifiedCount > 0 ? `${gitModifiedCount}` : undefined,
      badgeColor: 'badge-amber',
    },
  ];

  return (
    <aside className="sidebar-container">
      {/* 站点 Brand Logo */}
      <div style={{ padding: '20px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 34,
          height: 34,
          borderRadius: 8,
          background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          boxShadow: '0 2px 8px rgba(56, 189, 248, 0.3)',
        }}>
          <BookMarked size={20} />
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: '0.5px' }}>
            序记® Studio
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            本地内容管理中枢
          </div>
        </div>
      </div>

      {/* 导航项 */}
      <nav style={{ padding: '16px 8px', flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                background: isActive ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
                color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                border: '1px solid',
                borderColor: isActive ? 'rgba(56, 189, 248, 0.3)' : 'transparent',
                fontWeight: isActive ? 600 : 400,
                fontSize: 14,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Icon size={18} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`badge ${item.badgeColor}`} style={{ fontSize: 10, padding: '1px 6px' }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* 底部环境信息 */}
      <div style={{ padding: '16px', borderTop: '1px solid var(--border-subtle)', fontSize: 12, color: 'var(--text-muted)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <span>状态环境</span>
          <span style={{ color: 'var(--accent-emerald)' }}>● 127.0.0.1</span>
        </div>
        <div>专升本备考知识库专有后台</div>
      </div>
    </aside>
  );
};
