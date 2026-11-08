# GithubRepo：Markdown 里的 GitHub 仓库卡片

- 日期：2026-11-08
- 状态：采纳
- 相关文件：`app/components/content/GithubRepo.vue`、`content/pages/about.md`、`content/posts/markdown-showcase.md`

## 背景

已有的 `LinkCard` 是通用链接卡片，适合普通网页，但 GitHub 仓库通常需要更明确的视觉：仓库名、描述、语言、Star 数与「查看仓库」入口。用户希望新增一个 MDC 组件，在 Markdown 中直接插入 GitHub 仓库链接卡片。

## 选项

1. 继续用 `LinkCard`，手动传 GitHub 图标与描述。
2. 新建专用 `GithubRepo` MDC 组件，按 `owner/name` 生成链接与卡片布局。
3. 构建时请求 GitHub API，自动拉取 Star、语言与描述。

## 决策

选择方案 2：

- 新增 `app/components/content/GithubRepo.vue`，MDC 名称为 `::GithubRepo{...}`。
- props：
  - `repo`（必填）：`owner/name`，用于生成 `https://github.com/<repo>`。
  - `description`：仓库描述。
  - `language`：语言标签，前面带主色圆点。
  - `stars`：`string | number`，数字会按 `en-US` 格式化；省略时不显示。
  - `href`：覆盖默认链接，适合 GitHub Enterprise 或镜像地址。
- 卡片结构：顶部是 GitHub 图标 + 仓库名 + 「GitHub 仓库」小标签 + 外链箭头；底部是描述、语言、Star 与「查看仓库」。
- 不使用 `ClientOnly`，静态 HTML 直接包含卡片内容；`Icon` 组件在 SSR 下可用。
- 使用位置：
  - `content/pages/about.md`：链接 `AEBC08/blog`，说明这是博客源码。
  - `content/posts/markdown-showcase.md`：以 `nuxt/content` 为例展示组件语法。

## 后果

- 仓库信息是静态 props，不会自动更新 Star 数；需要准确数据时手动修改或后续接入构建期 API。
- `repo` 只做字符串拼接，不校验 `owner/name` 格式；写错时链接会 404，但不会影响构建。
- 组件继承站点扁平色板与 `--app-*` 令牌，明暗主题自动适配。
- 如果未来需要自动抓取 GitHub 元数据，应保留现有 props 作为覆盖值，避免离线构建失败。
