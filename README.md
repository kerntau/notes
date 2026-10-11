<div align="center">

# NOTES // 序记

**Docusaurus 驱动的备考笔记与学习知识库**<br>
*A structured, searchable study notebook.*

[![Docusaurus](https://img.shields.io/badge/Docusaurus-3.10-3ECC5F?style=for-the-badge&logo=docusaurus&logoColor=white)](https://docusaurus.io)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=111111)](https://react.dev)
[![pnpm](https://img.shields.io/badge/pnpm-11-F69220?style=for-the-badge&logo=pnpm&logoColor=white)](https://pnpm.io)
[![License](https://img.shields.io/badge/License-CC%20BY--NC--ND%204.0-555555?style=for-the-badge)](https://creativecommons.org/licenses/by-nc-nd/4.0/deed.zh-hans)

</div>

---

## 01. THE PURPOSE // 项目本源

序记是一个面向专升本备考的响应式知识库，包含 docs 笔记、blog 文章、倒计时和移动端阅读体验。

[Repository](https://github.com/kerntau/notes)

## 02. CORE ARCHITECTURE // 核心架构

~~~mermaid
graph LR
  D[docs and blog Markdown/MDX] --> DC[Docusaurus build]
  DC --> S[Static HTML + search]
  S --> R[GitHub Pages or static host]
  Studio[Optional studio] -.-> D
~~~

Docusaurus 负责文档路由、主题和静态构建；studio/ 是可选的内容管理实验工具，不是线上运行时依赖。

## 03. TECHNICAL MATRIX // 技术矩阵

| 模块 | 技术 | 说明 |
| --- | --- | --- |
| Site | Docusaurus 3.10 | docs/blog 路由与构建 |
| UI | React 19、主题 swizzle | 页面和移动端导航 |
| Search | 本地搜索插件 | 离线索引 |
| Tooling | pnpm、TypeScript | 依赖与类型检查 |
| Optional | studio/ | 内容工作台实验 |

## 04. REPOSITORY TOPOLOGY // 源码拓扑

~~~text
docs/                 # 知识库笔记
blog/                 # 博客和备考资讯
src/css/              # 主题变量与全局样式
src/pages/            # 自定义页面
src/theme/            # Docusaurus 主题扩展
docusaurus.config.ts  # 站点配置
studio/               # 可选 CMS 工具
~~~

## 05. CLONE & QUICK START // 极速开始

需要 Node.js 20+ 与 pnpm。

~~~bash
git clone https://github.com/kerntau/notes.git
cd notes
pnpm install
pnpm start
~~~

开发服务器默认 http://localhost:3000。类型检查和构建：

~~~bash
pnpm typecheck
pnpm build
pnpm serve
~~~

## 06. DEPLOYMENT & VERIFICATION // 部署与验证

build/ 可部署到 GitHub Pages、EdgeOne Pages 或其他静态托管。发布前验证文档路由、搜索索引、移动端抽屉和明暗主题。

## 07. ENGINEERING CONTRACT // 工程契约

- 文档 front matter 和侧边栏配置必须通过构建。
- 学习资料的版权声明不能被自动化脚本覆盖。
- 主题 swizzle 改动需同时验证桌面与移动端。
- studio/ 变更不得成为生产站点的隐式依赖。

## 08. ROADMAP // 演进路线

- [x] 响应式 docs/blog 知识库
- [x] 倒计时、搜索和暗色主题
- [ ] 更细的课程进度统计
- [ ] 可选的私有笔记与权限层

## 09. LICENSE // 许可证

笔记和资料默认遵循 CC BY-NC-ND 4.0；代码部分请以仓库声明为准。
