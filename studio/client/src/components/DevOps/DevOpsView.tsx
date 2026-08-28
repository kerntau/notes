import React, { useRef, useEffect } from 'react';
import {
  Play,
  Square,
  RotateCw,
  Package,
  Terminal as TerminalIcon,
  Trash2,
  Cpu,
  Clock,
} from 'lucide-react';
import { ProcessStatus } from '../../types';

interface DevOpsViewProps {
  procStatus: ProcessStatus;
  logs: string[];
  onAction: (action: 'start' | 'stop' | 'restart' | 'build') => void;
  onClearLogs: () => void;
}

export const DevOpsView: React.FC<DevOpsViewProps> = ({
  procStatus,
  logs,
  onAction,
  onClearLogs,
}) => {
  const terminalEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, height: '100%' }}>
      {/* 顶部控制面板 */}
      <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 'var(--radius-md)',
            background: procStatus.isRunning ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: procStatus.isRunning ? 'var(--accent-emerald)' : 'var(--text-muted)',
            border: '1px solid',
            borderColor: procStatus.isRunning ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-subtle)',
          }}>
            <Cpu size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600 }}>Docusaurus 开发服务</h3>
              <span className={`badge ${procStatus.isRunning ? 'badge-green' : ''}`} style={{ fontSize: 11 }}>
                {procStatus.isRunning ? `RUNNING (PID: ${procStatus.pid})` : 'STOPPED'}
              </span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              本地监听端口: 3000 · 模式: {procStatus.mode} {procStatus.uptimeSeconds ? `· 已运行 ${procStatus.uptimeSeconds}s` : ''}
            </div>
          </div>
        </div>

        {/* 动作按钮群 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {procStatus.isRunning ? (
            <>
              <button className="btn btn-secondary" onClick={() => onAction('restart')}>
                <RotateCw size={14} />
                <span>重启服务</span>
              </button>
              <button className="btn btn-danger" onClick={() => onAction('stop')}>
                <Square size={14} />
                <span>停止服务</span>
              </button>
            </>
          ) : (
            <button className="btn btn-primary" onClick={() => onAction('start')}>
              <Play size={14} />
              <span>启动服务 (pnpm start)</span>
            </button>
          )}

          <button className="btn btn-secondary" onClick={() => onAction('build')} title="执行全站生产打包">
            <Package size={14} />
            <span>生产构建 (pnpm build)</span>
          </button>
        </div>
      </div>

      {/* 实时终端日志流 */}
      <div className="glass-card" style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: '#090d16',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        overflow: 'hidden',
      }}>
        {/* 终端顶部标题栏 */}
        <div style={{
          padding: '10px 16px',
          background: 'rgba(15, 23, 42, 0.8)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
            <TerminalIcon size={15} color="var(--accent-primary)" />
            <span>实时进程输出与编译日志流</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>({logs.length} 行)</span>
          </div>

          <button className="btn btn-secondary" style={{ padding: '2px 8px', fontSize: 11 }} onClick={onClearLogs}>
            <Trash2 size={12} />
            <span>清空控制台</span>
          </button>
        </div>

        {/* 终端控制台文本区 */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          lineHeight: 1.6,
          color: '#cbd5e1',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
        }}>
          {logs.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>
              终端就绪，等待服务输出...
            </div>
          ) : (
            logs.map((line, idx) => (
              <div key={idx} style={{
                color: line.includes('error') || line.includes('Error') || line.includes('❌') ? '#f87171' :
                       line.includes('warn') || line.includes('Warn') || line.includes('⚠️') ? '#fbbf24' :
                       line.includes('success') || line.includes('✅') ? '#34d399' : '#cbd5e1',
              }}>
                {line}
              </div>
            ))
          )}
          <div ref={terminalEndRef} />
        </div>
      </div>
    </div>
  );
};
