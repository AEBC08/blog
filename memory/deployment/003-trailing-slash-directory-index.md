# 尾斜杠刷新：目录索引方案

- 日期：2026-11-07
- 状态：采纳
- 相关文件：`nuxt.config.ts`、`app/composables/useBlogPost.ts`、`app/utils/normalize-content-path.ts`

## 背景

静态托管下，文章 URL 有两种写法：`/blog/hello` 与 `/blog/hello/`。Nuxt 默认预渲染会生成 `blog/hello/index.html`；站点内链接使用不带尾斜杠的 `post.path`，而浏览器刷新或从外部打开带斜杠地址时必须仍能命中同一个文件。此前记录 002 选择 `autoSubfolderIndex: false`（生成 `blog/hello.html`），但在本地子路径静态服务器验证时，`/blog/hello` 会 301 到 `/blog/hello/`，而 `blog/hello.html` 无法响应目录形式，导致刷新 404。

## 选项

1. `autoSubfolderIndex: false`：生成 `blog/hello.html`，无尾斜杠直接命中；带尾斜杠的目录请求需要服务器回退。
2. `autoSubfolderIndex: true`：生成 `blog/hello/index.html`，带尾斜杠直接命中；无尾斜杠由静态服务器 301 到目录。
3. 引入 `nuxt-github-pages` 之类的模块复制 `404.html` 兜底。

## 决策

选择方案 2：

- `nitro.prerender.autoSubfolderIndex: true`（Nuxt 默认行为），产物为 `blog/hello/index.html`。
- 保留 `normalizeContentPath()`：即使路由是 `/blog/hello/`，查询仍使用 `/blog/hello`，与 Nuxt Content 的 path 精确匹配。
- 页面内链接继续使用 `post.path`（无尾斜杠）。
- 用 Python 静态服务器模拟 GitHub Pages 子路径验证：`/miuix-blog/blog/hello/` 返回 200，`/miuix-blog/blog/hello` 返回 301 且 `Location: /miuix-blog/blog/hello/`。

## 后果

- 刷新带尾斜杠的文章页不再 404；GitHub Pages 对目录请求的默认行为与验证环境一致。
- 无尾斜杠链接会多一次 301 跳转，属于静态托管的正常代价。
- 记录 002 的 `autoSubfolderIndex: false` 决策已废弃，保留备查。
- 若将来迁移到不做目录索引的平台，需要重新评估本决策。
