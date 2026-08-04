# 序记® (Notes) - 专升本备考笔记与学习知识库系统

<p align="center">
  <img src="https://img.shields.io/badge/Docusaurus-v3.10-3ECC5F?style=for-the-badge&logo=docusaurus&logoColor=white" alt="Docusaurus" />
  <img src="https://img.shields.io/badge/React-v19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-v6.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/License-CC%20BY--NC--ND%204.0-0284c7?style=for-the-badge" alt="License" />
</p>

**序记®** 是一个基于 [Docusaurus](https://docusaurus.io/) 驱动构建的高颜值、响应式备考笔记与极简学习知识库系统。集成专升本考试动态倒计时中枢、现代化移动端侧栏与沉浸式浅深色暗黑模式。

---

## ✨ 核心特性

- 🕒 **备考倒计时中枢**：首页实时动态倒计时，精准对齐备考目标节点。
- 📱 **移动端排版优化**：针对全尺寸移动视口深度重构，内置防透光全屏抽屉导航与微卡片排版。
- 🌓 **浅/暗色模式原生适配**：采用无框极简质感设计与自定义主题调色盘，护眼易读。
- ⚡ **高性能与 CI/CD**：基于 pnpm 依赖锁与 Edge 边缘网络加速分发。

---

## 📁 目录结构

```text
.
├── blog/                # 博客与备考资讯文章
├── docs/                # 知识库笔记与分类教程文档
├── src/
│   ├── css/custom.css   # 全局样式系统与响应式主题变量
│   ├── pages/           # 首页与自定义页面组件
│   └── theme/           # Docusaurus 主题 Swizzle 扩展组件
├── docusaurus.config.ts # 站点核心配置文件
├── pnpm-lock.yaml       # pnpm 锁定依赖清单
└── package.json         # 项目依赖与运行脚本
```

---

## 🛠️ 本地开发指南

### 1. 克隆仓库与安装依赖

```bash
git clone https://github.com/kerntau/notes.git
cd notes
pnpm install
```

### 2. 启动开发服务器

```bash
pnpm start
```

本地服务默认启动于 `http://localhost:3000/`，支持热更新（HMR）。

---

## 🚀 构建与部署

### 生产环境构建

```bash
pnpm build
```

构建产物将输出至 `build/` 目录，可直接部署至 EdgeOne Pages、GitHub Pages 或 Cloudflare Pages 等静态托管平台。

---

## 📄 版权与使用协议

本项目包含的所有笔记、教程与备考资料遵循 [CC BY-NC-ND 4.0](https://creativecommons.org/licenses/by-nc-nd/4.0/deed.zh-hans) 知识共享许可协议。

- **署名 (BY)**：使用或参考必须保留原作者署名及本站点链接。
- **非商业性使用 (NC)**：未经授权，禁止任何形式的商业盈利行为。
- **禁止演绎 (ND)**：禁止任何二次开发、二次打包或公开发布转载。
