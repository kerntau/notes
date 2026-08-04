# 网站说明

本项目使用现代静态网站生成器 [Docusaurus](https://docusaurus.io/) 构建。

## 安装依赖

```bash
pnpm install
```

> **注意**：可根据需要使用任意包管理器（如 pnpm / npm / yarn）。

## 本地开发

```bash
pnpm start
```

该命令将启动本地开发服务器并实时预览改动。大部分修改无需重启服务器即可生效。

## 构建产物

```bash
pnpm build
```

该命令将生成静态文件至 `build` 目录，可部署到任何静态资源托管服务中。

## 部署

使用 SSH 部署：

```bash
USE_SSH=true pnpm run deploy
```

不使用 SSH 部署：

```bash
GIT_USER=<你的 GitHub 用户名> pnpm run deploy
```

若使用 GitHub Pages 托管，该命令可快速完成网站构建并推送到 `gh-pages` 分支。

