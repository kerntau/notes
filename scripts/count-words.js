const fs = require('fs');
const path = require('path');

function getFiles(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(file));
    } else if (file.endsWith('.md') || file.endsWith('.mdx')) {
      results.push(file);
    }
  });
  return results;
}

const docsFiles = getFiles(path.join(__dirname, '../docs'));
const blogFiles = getFiles(path.join(__dirname, '../blog'));
const allFiles = [...docsFiles, ...blogFiles];

let totalCJK = 0;
let totalEng = 0;

allFiles.forEach(filePath => {
  const content = fs.readFileSync(filePath, 'utf8');
  // 移除 YAML frontmatter
  const clean = content.replace(/^---[\s\S]*?---/, '');
  
  // 统计中文字符
  const cjkMatches = clean.match(/[\u4e00-\u9fa5]/g);
  const cjkCount = cjkMatches ? cjkMatches.length : 0;
  
  // 统计英文单词
  const engMatches = clean.replace(/[\u4e00-\u9fa5]/g, ' ').match(/[a-zA-Z0-9_-]+/g);
  const engCount = engMatches ? engMatches.length : 0;

  totalCJK += cjkCount;
  totalEng += engCount;
});

const totalWords = totalCJK + totalEng;

const dataDir = path.join(__dirname, '../src/data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let gitCommit = 'latest';
let gitMsg = '最新提交笔记';
let gitAuthor = 'kerntau';
let gitDate = new Date().toISOString().split('T')[0];
let appVersion = 'latest';

try {
  const cp = require('child_process');
  const rootDir = path.join(__dirname, '..');

  // 1. 识别 CI/CD 部署环境变量（Vercel, GitHub Actions, Cloudflare Pages 等）
  const envSha = process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA || process.env.CF_PAGES_COMMIT_SHA;
  const envMsg = process.env.VERCEL_GIT_COMMIT_MESSAGE;
  const envAuthor = process.env.VERCEL_GIT_COMMIT_AUTHOR_LOGIN || process.env.GITHUB_ACTOR;

  if (envSha) {
    gitCommit = envSha.substring(0, 7);
  } else {
    try {
      gitCommit = cp.execSync('git rev-parse --short HEAD', { cwd: rootDir }).toString().trim();
    } catch (e) {}
  }

  if (envMsg) {
    gitMsg = envMsg.split('\n')[0].trim();
  } else {
    try {
      gitMsg = cp.execSync('git log -1 --pretty=%s', { cwd: rootDir }).toString().trim();
    } catch (e) {}
  }

  if (envAuthor) {
    gitAuthor = envAuthor;
  } else {
    try {
      gitAuthor = cp.execSync('git log -1 --pretty=%an', { cwd: rootDir }).toString().trim();
    } catch (e) {}
  }

  try {
    gitDate = cp.execSync('git log -1 --pretty=%cd --date=format:"%Y-%m-%d %H:%M"', { cwd: rootDir }).toString().trim();
  } catch (e) {
    gitDate = new Date().toISOString().replace('T', ' ').substring(0, 16);
  }

  // 2. 版本号获取逻辑：精确匹配 Tag，若无 Tag 则显示短 Commit Hash
  try {
    const exactTag = cp.execSync('git describe --tags --exact-match', { cwd: rootDir, stdio: ['pipe', 'pipe', 'ignore'] }).toString().trim();
    appVersion = exactTag.startsWith('v') ? exactTag : `v${exactTag}`;
  } catch (err) {
    appVersion = gitCommit;
  }
} catch (e) {
  console.warn('Git info fallback notice:', e.message);
}

const statsData = {
  docsCount: docsFiles.length,
  blogCount: blogFiles.length,
  totalFiles: allFiles.length,
  totalCJK,
  totalEng,
  totalWords,
  updatedAt: new Date().toISOString().split('T')[0],
  gitCommit,
  gitMsg,
  gitAuthor,
  gitDate,
  appVersion
};

fs.writeFileSync(
  path.join(dataDir, 'stats.json'),
  JSON.stringify(statsData, null, 2),
  'utf8'
);

console.log('Site statistics generated:', statsData);
