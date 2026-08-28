import {
  FileNode,
  DocDetail,
  ImageItem,
  StatsOverview,
  HealthIssue,
  SiteConfig,
  ProcessStatus,
  GitRepoStatus,
} from '../types';

const API_BASE = '/api/v1';
const REQUEST_TIMEOUT_MS = 15000;

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${url}`, {
      ...options,
      signal: options?.signal || controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("请求超时，请检查本地服务是否正常运行");
    }
    throw new Error("无法连接后台服务，请确认 Studio 服务已启动");
  } finally {
    window.clearTimeout(timeoutId);
  }

  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.success) {
    throw new Error(json.error || json.message || '请求失败');
  }
  return json.data !== undefined ? json.data : json;
}

export const api = {
  // Docs
  getDocsTree: () => request<FileNode[]>('/docs/tree'),
  getDocDetail: (path: string) => request<DocDetail>(`/docs/detail?path=${encodeURIComponent(path)}`),
  saveDoc: (data: { path: string; frontmatter?: Record<string, any>; content?: string; raw?: string }) =>
    request<{ message: string }>('/docs/save', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  createDoc: (data: { parentPath: string; name: string; isDirectory: boolean; initialTitle?: string }) =>
    request<{ relativePath: string }>('/docs/create', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  moveDoc: (data: { sourcePath: string; destPath: string }) =>
    request<{ message: string }>('/docs/move', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  deleteDoc: (path: string) =>
    request<{ message: string }>(`/docs/delete?path=${encodeURIComponent(path)}`, {
      method: 'DELETE',
    }),

  // Media
  getMediaList: () => request<ImageItem[]>('/media/list'),
  uploadMedia: async (files: File[]) => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    let res: Response;
    try {
      res = await fetch(`${API_BASE}/media/upload`, {
        method: 'POST',
        signal: controller.signal,
        body: formData,
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') throw new Error('上传超时，请检查文件大小或本地服务状态');
      throw new Error('无法连接后台服务，请确认 Studio 服务已启动');
    } finally {
      window.clearTimeout(timeoutId);
    }
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.success) throw new Error(json.error || '上传失败');
    return json.data as ImageItem[];
  },
  deleteMedia: (path: string) =>
    request<{ message: string }>(`/media/delete?path=${encodeURIComponent(path)}`, {
      method: 'DELETE',
    }),
  getOrphanMedia: () =>
    request<{ totalImages: number; orphansCount: number; orphans: ImageItem[] }>('/media/orphans'),

  // Stats & Health
  getStatsOverview: () => request<StatsOverview>('/stats/overview'),
  getHealthIssues: () => request<{ totalIssues: number; issues: HealthIssue[] }>('/stats/health'),

  // Site Config
  getSiteConfig: () => request<SiteConfig>('/config/site'),
  updateSiteConfig: (data: Partial<SiteConfig>) =>
    request<{ message: string }>('/config/site', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // DevOps
  getDevOpsStatus: () => request<{ status: ProcessStatus; logs: string[] }>('/devops/status'),
  devopsAction: (action: 'start' | 'stop' | 'restart' | 'build') =>
    request<{ message: string; output?: string }>('/devops/action', {
      method: 'POST',
      body: JSON.stringify({ action }),
    }),

  // Git
  getGitStatus: () => request<GitRepoStatus>('/git/status'),
  getGitDiff: (file?: string) => request<{ diff: string }>(`/git/diff${file ? `?file=${encodeURIComponent(file)}` : ''}`),
  stageGitFile: (file: string, staged: boolean) =>
    request<{ message: string }>('/git/stage', {
      method: 'POST',
      body: JSON.stringify({ file, staged }),
    }),
  commitGit: (data: { type: string; scope?: string; subject: string; body?: string }) =>
    request<{ message: string; data: string }>('/git/commit', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
