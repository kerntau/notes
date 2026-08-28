import React, { lazy, Suspense, useState, useEffect } from 'react';
import { Sidebar, TabType } from './components/Layout/Sidebar';
import { Header } from './components/Layout/Header';
import { useWebSocket } from './hooks/useWebSocket';
import { api } from './services/api';
import { GitRepoStatus } from './types';
const DashboardView = lazy(() => import('./components/Dashboard/DashboardView').then(m => ({ default: m.DashboardView })));
const DocsView = lazy(() => import('./components/Docs/DocsView').then(m => ({ default: m.DocsView })));
const MediaView = lazy(() => import('./components/Media/MediaView').then(m => ({ default: m.MediaView })));
const ConfigView = lazy(() => import('./components/Config/ConfigView').then(m => ({ default: m.ConfigView })));
const DevOpsView = lazy(() => import('./components/DevOps/DevOpsView').then(m => ({ default: m.DevOpsView })));
const GitView = lazy(() => import('./components/Git/GitView').then(m => ({ default: m.GitView })));

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const { logs, procStatus, connected, clearLogs } = useWebSocket();
  const [gitStatus, setGitStatus] = useState<GitRepoStatus | null>(null);
  const [actionBusy, setActionBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // 定期刷新 Git 状态以展示右上角/侧边栏徽标
  useEffect(() => {
    api.getGitStatus().then(setGitStatus).catch(() => {});
    const timer = window.setInterval(() => api.getGitStatus().then(setGitStatus).catch(() => {}), 30000);
    return () => window.clearInterval(timer);
  }, []);

  const handleDevAction = async (action: 'start' | 'stop' | 'restart' | 'build') => {
    if (actionBusy) return;
    try {
      setActionError(null);
      setActionBusy(true);
      await api.devopsAction(action);
    } catch (e: any) {
      setActionError(e instanceof Error ? e.message : '操作失败');
    } finally {
      setActionBusy(false);
    }
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return '知识库概览与备考大盘';
      case 'docs':
        return '知识库文档管理与编辑器';
      case 'media':
        return '静态媒体与素材中枢';
      case 'config':
        return '站点配置与备考中枢';
      case 'devops':
        return 'DevOps 进程与构建终端';
      case 'git':
        return 'Git 规范化提交工作流';
      default:
        return '序记® Studio';
    }
  };

  return (
    <div className="app-container">
      {/* 左侧导航栏 */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        devRunning={procStatus.isRunning}
        gitModifiedCount={gitStatus?.files.length || 0}
      />

      {/* 右侧主工作区 */}
      <div className="main-content">
        <Header
          title={getTabTitle()}
          procStatus={procStatus}
          onDevAction={handleDevAction}
          actionBusy={actionBusy}
          connected={connected}
        />
        {actionError && <div className="studio-inline-error" role="alert"><span>{actionError}</span><button type="button" className="btn btn-secondary" onClick={() => setActionError(null)}>关闭</button></div>}

        <main className="content-body" style={{ padding: activeTab === 'docs' ? 0 : 24 }}>
          <Suspense fallback={<div className="studio-loading" role="status">正在加载工作区…</div>}>
            {activeTab === 'dashboard' && <DashboardView onNavigate={setActiveTab} />}
            {activeTab === 'docs' && <DocsView />}
            {activeTab === 'media' && <MediaView />}
            {activeTab === 'config' && <ConfigView />}
            {activeTab === 'devops' && (
              <DevOpsView
                procStatus={procStatus}
                logs={logs}
                onAction={handleDevAction}
                onClearLogs={clearLogs}
              />
            )}
            {activeTab === 'git' && <GitView />}
          </Suspense>
        </main>
      </div>
    </div>
  );
};

export default App;
