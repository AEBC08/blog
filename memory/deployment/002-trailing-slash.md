# 刷新文章页 404 与尾斜杠

- 日期：2026-11-07
- 状态：已废弃（被 [003 目录索引方案](003-trailing-slash-directory-index.md) 取代）
- 相关文件：`nuxt.config.ts`、`app/composables/useBlogPost.ts`、`app/utils/normalize-content-path.ts`、`public/.nojekyll`

> 本记录保留备查。实际验证发现 `autoSubfolderIndex: false` 在目录式静态服务器下会让带尾斜杠刷新 404，最终改用 `autoSubfolderIndex: true`，见 003。

## 背景

静态托管下，访问 `/blog/hello/`（带尾斜杠）与 `/blog/hello`（不带）可能映射到不同文件。Nuxt 默认预渲染会生成 `blog/hello/index.html`，而站点内链接通常是 `/blog/hello`；GitHub Pages 在刷新带斜杠地址时也可能找不到文件，表现为 404。

## 选项

1. 引入 `nuxt-github-pages` 模块，构建后复制 `404.html`。
2. 设置 `nitro.prerender.autoSubfolderIndex: false`，生成 `blog/hello.html`，让无尾斜杠路径直接命中。
3. 仅依赖应用层路径归一化，不改变产物结构。

## 决策

选择方案 2，并保留方案 3 作为应用层兜底：

- `nitro.prerender.autoSubfolderIndex: false`，产物为 `blog/hello.html`。
- `normalizeContentPath()` 去掉 query/hash 与末尾 `/`，因此即使路由是 `/blog/hello/`，`queryCollection('blog').path('/blog/hello')` 仍能命中。
- 静态服务器的目录索引行为与 GitHub Pages 不完全一致，最终以本地子路径模拟构建 + 静态服务器验证为准。

## 后果

- 文章页刷新不依赖目录索引，减少 404。
- 若将来改用 `nuxt-github-pages` 或 Cloudflare Pages，需要重新验证产物结构。
- 页面内链接统一使用 `post.path`（无尾斜杠），避免产生两种 URL。
