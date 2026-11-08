# baseURL `/blog/` 与 `/blog` 路由冲突：文章前缀改为 `/posts`

- 日期：2026-11-08
- 状态：采纳
- 相关文件：`nuxt.config.ts`、`content.config.ts`、`app/app.config.ts`、`app/pages/posts/*`、`content/posts/*`、`app/components/layout/TopBar.vue`、`app/components/sidebar/*`、`app/components/post/*`、`app/error.vue`、`scripts/new-post.mjs`

## 背景

仓库名是 `blog`，GitHub Pages 项目站点因此使用 `NUXT_APP_BASE_URL=/blog/`。同时，文章路由最初也以 `/blog` 为前缀：

- 文章列表：`/blog`
- 文章详情：`/blog/hello`
- 关于页：`/about`

子路径构建后，Nuxt 无法区分「部署前缀」与「应用路由前缀」，出现两类错误：

1. 站内链接变成 `/blog/blog`、`/blog/blog/hello`。
2. 预渲染产物的 payload 地址被错误处理，例如请求 `/blog/interactive/_payload.json` 返回 404，导致文章页预渲染失败。

## 选项

1. 把仓库改名为非 `blog`，让 baseURL 与路由前缀错开。
2. 把 `NUXT_APP_BASE_URL` 设为 `/`，改用用户站点或自定义域名。
3. 保留仓库名与 `/blog/` 部署前缀，把应用内的文章路由前缀改为 `/posts`。
4. 继续使用 `/blog` 路由，靠额外的 rewrite/redirect 规则绕过。

## 决策

选择方案 3：

- 路由与目录：
  - `app/pages/blog/` → `app/pages/posts/`
  - `content/blog/` → `content/posts/`
  - 文章列表路由 `/posts`，详情路由 `/posts/hello`。
- `content.config.ts` 的集合名仍为 `blog`，只把 `source` 改为 `posts/**/*.md`；`queryCollection('blog')` 与 `BlogCollectionItem` 类型无需重命名。
- `nuxt.config.ts` 的预渲染路由改为 `['/', '/posts']`。
- 所有站内链接、导航、分类/标签筛选、文章元信息、相邻文章、错误页、README 与 `scripts/new-post.mjs` 的 `CONTENT_DIR` 同步改为 `/posts` 与 `content/posts`。
- 部署前缀继续由工作流按仓库名生成，仓库为 `blog` 时仍是 `/blog/`。

## 后果

- 公开 URL 形如 `https://aebc08.github.io/blog/posts/hello`：`/blog/` 是部署前缀，`/posts/hello` 是应用路由。
- 内部集合名 `blog` 与公开前缀 `/posts` 不一致，阅读代码时需要注意；这是为了保留既有类型与查询封装、减少改动面。
- 旧记忆记录中的 `/blog/hello`、`content/blog/*` 描述的是改名前的历史状态，不应作为当前路径引用。
- 以后若把站点迁到根路径或自定义域名，可以把 baseURL 改为 `/`，但 `/posts` 路由可以保持不变。
- 新增页面或脚本时不要重新引入 `/blog` 作为应用路由前缀，否则冲突会复现。
