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
let gitMsg = '';
let appVersion = 'v1.0.0';

try {
  const cp = require('child_process');
  const rootDir = path.join(__dirname, '..');
  gitCommit = cp.execSync('git rev-parse --short HEAD', { cwd: rootDir }).toString().trim();
  gitMsg = cp.execSync('git log -1 --pretty=%s', { cwd: rootDir }).toString().trim();
  
  try {
    const rawTag = cp.execSync('git describe --tags --always', { cwd: rootDir }).toString().trim();
    appVersion = rawTag.startsWith('v') ? rawTag : `v${rawTag}`;
  } catch (err) {
    const pkg = require('../package.json');
    appVersion = `v${pkg.version || '1.0.0'}`;
  }
} catch (e) {}

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
  appVersion
};

fs.writeFileSync(
  path.join(dataDir, 'stats.json'),
  JSON.stringify(statsData, null, 2),
  'utf8'
);

console.log('Site statistics generated:', statsData);
