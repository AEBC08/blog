# 封面图方案 B

- 日期：2026-11-07
- 状态：采纳
- 相关文件：`app/utils/resolve-cover-image.ts`、`public/covers/*`、`content/blog/*.md`

## 背景

project.md 要求在方案 A（`nuxt-content-assets` 相对路径）与方案 B（`public/` + frontmatter 绝对路径）中选一个执行到底，并统一解析封面路径。

## 选项

1. 方案 A：`nuxt-content-assets`，保留 Markdown 相对路径。
2. 方案 B：图片放 `public/`，frontmatter 写 `/covers/xxx.svg`。

## 决策

选择方案 B：

- 所有封面、头像放在 `public/covers/`。
- frontmatter 的 `image` 写站点根绝对路径（如 `/covers/hello.svg`）。
- `resolveCoverImage(image)` 统一处理：
  - `http(s)://` 与 `data:` 原样返回
  - 其余去掉前导 `/`，拼上 `useRuntimeConfig().app.baseURL`
  - 保证 GitHub Pages 项目站点前缀 `/repo/` 自动生效
- 列表卡片与文章页共用该函数。

## 后果

- 不需要额外安装 `nuxt-content-assets`，也不依赖 Content 的资源转换。
- 图片必须放在 `public/`，不能和 `.md` 同目录；写作时路径是站点绝对路径。
- 若将来配置自定义域名，把 `NUXT_APP_BASE_URL` 设为 `/` 即可，封面解析无需改代码。
