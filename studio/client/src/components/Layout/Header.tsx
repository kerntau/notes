import React from 'react';
import { ExternalLink, Play, Square, RotateCw } from 'lucide-react';
import { ProcessStatus } from '../../types';

interface HeaderProps {
  title: string;
  procStatus: ProcessStatus;
  onDevAction: (action: 'start' | 'stop' | 'restart') => void;
 actionBusy?: boolean;
  connected?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ title, procStatus, onDevAction, actionBusy = false, connected = false }) => {
  return (
    <header style={{
      height: 60,
      borderBottom: '1px solid var(--border-subtle)',
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(12px)',
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <h1 style={{ fontSize: 18, fontWeight: 600, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
          {title}
        </h1>
        <span className={connected ? 'badge badge-green' : 'badge badge-amber'} style={{ fontSize: 10 }} title="实时日志连接状态">
          {connected ? '实时连接' : '正在重连'}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Docusaurus 快捷控制 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: 'rgba(30, 41, 59, 0.6)',
          padding: '4px 8px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
        }}>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', marginRight: 4 }}>
            前台服务:
          </span>
          {procStatus.isRunning ? (
            <>
              <span className="badge badge-green" style={{ fontSize: 11 }}>运行中 :3000</span>
              <button
                className="btn btn-secondary"
                style={{ padding: '4px 8px', fontSize: 12 }}
                onClick={() => onDevAction('restart')}
                title="重启服务"
                disabled={actionBusy}
              >
                <RotateCw size={13} />
              </button>
              <button
                className="btn btn-danger"
                style={{ padding: '4px 8px', fontSize: 12 }}
                onClick={() => onDevAction('stop')}
                title="停止服务"
                disabled={actionBusy}
              >
                <Square size={13} />
              </button>
            </>
          ) : (
            <>
              <span className="badge" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)', fontSize: 11 }}>未启动</span>
              <button
                className="btn btn-primary"
                style={{ padding: '4px 10px', fontSize: 12 }}
                onClick={() => onDevAction('start')}
                disabled={actionBusy}
              >
                <Play size={13} />
                <span>启动</span>
              </button>
            </>
          )}
        </div>

        {/* 访问前台按钮 */}
        <a
          href="http://localhost:3000"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secondary"
          style={{ fontSize: 13, textDecoration: 'none' }}
        >
          <span>查看前台</span>
          <ExternalLink size={14} />
        </a>
      </div>
    </header>
  );
};
