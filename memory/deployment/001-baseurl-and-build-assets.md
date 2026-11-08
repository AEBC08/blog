# baseURL、buildAssetsDir 与 `.nojekyll`

- 日期：2026-11-07
- 状态：采纳
- 相关文件：`nuxt.config.ts`、`public/.nojekyll`、`app/utils/resolve-cover-image.ts`

## 背景

GitHub Pages 项目站点部署在 `https://<user>.github.io/<repository>/` 子路径下。若 `baseURL` 保持 `/`，JS/CSS/图片会请求域名根路径而 404。另一个坑是 GitHub Pages 默认使用 Jekyll，会忽略以下划线开头的目录（默认构建产物 `_nuxt/`），导致资源整体 404。

## 选项

1. 只用 `baseURL` + `.nojekyll`，保留 `_nuxt` 目录名。
2. 使用 `baseURL` + 自定义 `buildAssetsDir`（如 `nuxt_assets`），再配合 `.nojekyll`。
3. 使用 `nuxt-github-pages` 模块自动处理。

## 决策

选择方案 2，并同时保留 `.nojekyll`：

- `app.baseURL = process.env.NUXT_APP_BASE_URL || '/'`。
- `app.buildAssetsDir = 'nuxt_assets'`，避开下划线目录。
- `public/.nojekyll` 空文件随构建产物发布，关闭 Jekyll 处理。
- 封面图统一通过 `resolveCoverImage()` 拼接 `useRuntimeConfig().app.baseURL`，frontmatter 只写 `/covers/xxx.svg`。

CI 中设置 `NUXT_APP_BASE_URL=/${{ github.event.repository.name }}/`，本地用同名环境变量模拟。

## 后果

- 构建产物的资源路径为 `/<repo>/nuxt_assets/...`。
- 自定义域名或用户站点应把 `NUXT_APP_BASE_URL` 设为 `/`，无需改代码。
- `.nojekyll` 是双保险：即使将来改回 `_nuxt` 也不会被 Jekyll 忽略。
