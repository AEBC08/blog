# GithubRepo 改为构建期读取 GitHub API

- 日期：2026-11-08
- 状态：采纳（取代 [005](005-github-repo-card-fields.md)）
- 相关文件：`app/components/content/GithubRepo.vue`、`nuxt.config.ts`、`.github/workflows/deploy.yml`、`content/pages/about.md`、`content/posts/markdown-showcase.md`

## 背景

005 让作者手填 `stars` / `forks` / `license`，但这类数字会过期，写死在 Markdown 里维护成本高。用户要求「和头像一样去请求 API 获取」，并且每个字段都像 `show-avatar` 一样可以开关。

## 选项

1. 继续手填静态值（005 的方案）。
2. 访客浏览器发起请求：SSR 里没有数据、每次都打 API，匿名 60 次/小时会被打满。
3. **在预渲染时就抓取**，把结果写进页面 payload；失败时回落到可选静态 props。

## 决策

选择方案 3。`GithubRepo` 在 `script setup` 顶部 `await useAsyncData` 请求
`https://api.github.com/repos/<owner>/<name>`，只取 `language`、`stargazers_count`、
`forks_count`、`license.spdx_id`、`owner.avatar_url`：

- 开关：`show-language` / `show-stars` / `show-forks` / `show-license` 默认 `true`，`show-avatar` 默认 `false`，与用户要求一致。
- 静态 `language` / `stars` / `forks` / `license` 保留为**离线或限流时的兜底**，不传就不显示，不会再要求作者手填。
- `license` 优先取 SPDX 标识（`NOASSERTION` 时退回许可证名称）。
- `show-avatar` 优先用 `avatar` prop（可传本地图，走 `resolveCoverImage`），否则用 API 返回的 `owner.avatar_url`，最后兜底 `https://github.com/<owner>.png?size=80`。
- 请求失败 `catch` 后返回 `null`，卡片只显示仓库名与描述，不抛错、不影响构建。
- Nuxt `runtimeConfig.githubToken`（服务端专用）在 CI 里提升限额；`deploy.yml` 传入 `secrets.GITHUB_TOKEN`。
- `useAsyncData` 使用 `github-repo:<repo>` 作为 key，保证 payload 命中、同仓库多卡片复用。

## 后果

- 页面 HTML 里直接带数据，访客不请求 GitHub API，断网也能看到数字。
- 组件 setup 变成 async，依赖 Nuxt 根 `<Suspense>`；用 `pnpm dev` 的 SSR 冒烟测试确认可渲染（本次构建期网络被沙箱证书拦截，回落分支生效，卡片不报错）。
- 数据只在构建时刷新：Star 数要等下一次部署才更新，这是静态站的预期。
- 新增图标注册 `license`（`IconLicense`），遵守 [layout/006](../layout/006-icon-system.md) 的注册表规则。
- 无网络的本地构建会让卡片退化成「只有仓库名 + 描述」，若在意可在 Markdown 里补静态 props。
