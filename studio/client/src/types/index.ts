export interface FileNode {
  name: string;
  relativePath: string;
  fullPath: string;
  isDirectory: boolean;
  sizeBytes?: number;
  updatedAt?: string;
  title?: string;
  sidebarPosition?: number;
  tags?: string[];
  children?: FileNode[];
}

export interface DocDetail {
  relativePath: string;
  filename: string;
  frontmatter: Record<string, any>;
  content: string;
  raw: string;
  sizeBytes: number;
  updatedAt: string;
}

export interface ImageItem {
  name: string;
  relativePath: string;
  sizeBytes: number;
  updatedAt: string;
}

export interface StatsOverview {
  docsCount: number;
  blogCount: number;
  totalFiles: number;
  totalCJK: number;
  totalEng: number;
  totalWords: number;
  updatedAt: string;
  gitCommit: string;
  gitMsg: string;
  gitAuthor: string;
  gitDate: string;
  appVersion: string;
  categories?: Record<string, { count: number; words: number }>;
}

export interface HealthIssue {
  file: string;
  type: 'broken_link' | 'broken_image' | 'missing_metadata' | 'warning';
  message: string;
  target?: string;
}

export interface SiteConfig {
  title: string;
  tagline: string;
  announcement: {
    enabled: boolean;
    content: string;
  };
  examDate: string;
}

export interface ProcessStatus {
  isRunning: boolean;
  pid?: number;
  mode: 'dev' | 'build' | 'idle';
  lastLog?: string;
  uptimeSeconds?: number;
}

export interface GitFileStatus {
  path: string;
  status: 'modified' | 'added' | 'deleted' | 'untracked' | 'renamed';
  staged: boolean;
}

export interface GitRepoStatus {
  currentBranch: string;
  isClean: boolean;
  files: GitFileStatus[];
  lastCommit?: {
    hash: string;
    message: string;
    author: string;
    date: string;
  };
}
