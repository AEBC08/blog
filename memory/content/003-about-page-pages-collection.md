# 关于页：Markdown + Vue 混合与 pages 集合

- 日期：2026-11-08
- 状态：采纳
- 相关文件：`content.config.ts`、`content/pages/about.md`、`app/pages/about.vue`、`app/components/content/FriendLinks.vue`、`app/app.config.ts`、`app/components/layout/TopBar.vue`

## 背景

用户需要一个关于页：前半部分写个人信息，后半部分放友链，并明确要求「Markdown + Vue 混合」，既能像写文章一样编辑，又能插入高级 Vue 组件。

如果整页写成纯 Vue，个人信息每次修改都要动模板；如果整页写成纯 Markdown，友链列表、空状态与后续交互组件又难以复用。

## 选项

1. 纯 Markdown（MDC），友链直接写成静态列表。
2. 纯 Vue 页面，个人信息写死在模板里。
3. Markdown 负责正文，Vue 页面负责外壳与高级区块：新增 `pages` 集合，页面用 `ContentRenderer` 渲染 Markdown，再挂载 Vue 组件。

## 决策

选择方案 3：

- `content.config.ts` 新增 `pages` 集合：`type: 'page'`、`source: 'pages/**/*.md'`、schema 仅要求可选 `description`。
- `content/pages/about.md` 提供标题、描述与正文（关于我 / 这个站点 / 现在）。
- `app/pages/about.vue`：
  - 用 `queryCollection('pages').path('/pages/about').first()` 读取内容。
  - 顶部是 Vue 外壳：头像、`About` 微标签、标题与描述。
  - 正文交给 `<ContentRenderer :value="page" class="post-content" />`，复用现有 prose 样式。
  - 正文之后挂载 `<FriendLinks />`。
- `app/components/content/FriendLinks.vue`：
  - 从 `appConfig.friends` 读取友链数组。
  - 有数据时渲染双列卡片；为空时显示「友链还在整理中」空状态。
  - 「交换友链」按钮指向 `appConfig.profile.links` 中的 GitHub 地址。
- 友链类型 `FriendLink` 与空数组 `friends` 定义在 `app/app.config.ts`，后续添加友链只需填数组，不需要改模板。
- 顶栏「关于」导航指向 `/about`；首页 hero 也提供「关于我」入口。

## 后果

- `content/pages/about.md` 在 Content 中的路径是 `/pages/about`，而公开路由是 `/about`；查询时必须使用前者。新增独立页面时要同时创建 `content/pages/<name>.md` 与 `app/pages/<name>.vue`。
- 关于页不进入文章列表，也不参与文章排序、分类与标签统计。
- 关于页使用独立的居中单栏布局，不显示文章侧边栏，避免个人信息与 Profile 卡片重复。
- 友链目前为空数组，页面显示空状态；添加友链只需在 `appConfig.friends` 中追加 `{ name, href, description, icon? }`。
- Markdown 正文继续支持 MDC 组件、KaTeX、Mermaid 等既有能力，因为复用了同一个 `ContentRenderer` 与 prose 样式。
