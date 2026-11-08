# Content 集合、schema 与查询封装

- 日期：2026-11-07
- 状态：采纳
- 相关文件：`content.config.ts`、`app/composables/useBlogList.ts`、`app/composables/useBlogPost.ts`、`app/composables/useSidebarData.ts`

## 背景

核心工作流是「在 `content/blog/` 放一个 `.md` 就自动成为文章」。需要统一 draft 过滤、排序、单篇 404、尾斜杠与类型来源。

## 选项

1. 在页面里直接写 `queryCollection`。
2. 用 `useAsyncData` 封装成 composable，页面只消费结果。
3. 用 Nitro server API 代理查询。

## 决策

选择方案 2：

- `content.config.ts`：
  - `type: 'page'`、`source: 'blog/**/*.md'`
  - `published: z.date()`、`description`、`tags` 默认 `[]`、`category`、`draft` 默认 `false`、`image`、`lang`、`layout` 枚举
- `useBlogList()`：
  - 稳定 key `'blog-list'`
  - `.where('draft', '=', false).order('published', 'DESC')`
  - 只 `select` 列表字段：`id/path/title/description/published/tags/category/image/layout`
- `useBlogPost(path?)`：
  - key 为 `` `blog-post:${normalizedPath}` ``
  - 默认取 `route.path`，经 `normalizeContentPath` 去掉末尾 `/`
  - `null` 或 `draft` 抛 `createError({ statusCode: 404, fatal: true })`
  - `useAsyncData` 捕获错误后再次抛 404，保证静态访问草稿也失败
- `useSidebarData()` 复用 `useBlogList()` 的 key 聚合分类/标签，不额外请求。

## 后果

- 生成类型 `BlogCollectionItem` 是 schema 的唯一类型来源；该接口由 Nuxt Content 在 `.nuxt/content/types.d.ts` 中扩展。
- 生成的 `published` 类型是 `string`，不是 `Date`；排序仍可用 ISO 字符串，展示用 `formatDate`。
- `useBlogPost` 同时被文章页与 `TocWidget` 调用，但相同 key 会去重；后续若发现重复 404，可让 TocWidget 只读已有 data。
- 静态预渲染会爬取 `/blog` 上的链接，草稿不在列表中，因此不会被预渲染。
