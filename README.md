# 序记® Notes

基于 Docusaurus 的响应式备考笔记与学习知识库，聚合专升本考试动态、课程笔记与可检索的教程文档。

## 特性

- 备考目标倒计时与首页信息面板
- docs/ 知识库和 blog/ 资讯文章
- 移动端抽屉导航与响应式排版
- 原生浅色/深色模式和自定义主题
- 本地搜索与 pnpm 锁定依赖
- studio/ 可选的内容管理实验工具

## 目录

~~~text
blog/                # 博客和备考资讯
docs/                # 知识库文档
src/css/             # 全局样式和主题变量
src/pages/           # 自定义页面
src/theme/           # Docusaurus 主题扩展
docusaurus.config.ts # 站点配置
studio/              # 可选 CMS 工具
~~~

## 本地开发

需要 Node.js 20+ 与 pnpm。

~~~bash
git clone https://github.com/kerntau/notes.git
cd notes
pnpm install
pnpm start
~~~

开发服务器默认运行在 http://localhost:3000。生产构建与预览：

~~~bash
pnpm build
pnpm serve
~~~

类型检查：

~~~bash
pnpm typecheck
~~~

如需运行 Studio：

~~~bash
pnpm studio:dev
~~~

## 内容与版权

笔记、教程和备考资料的授权以仓库声明为准，默认采用 CC BY-NC-ND 4.0。转载或引用时请保留署名，不要将资料用于商业用途或发布改编版本。
