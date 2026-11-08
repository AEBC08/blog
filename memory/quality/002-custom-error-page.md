# 自定义错误页与静态 404

- 日期：2026-11-07
- 状态：采纳
- 相关文件：`app/error.vue`、`app/components/layout/TopBar.vue`、`app/components/layout/FooterBar.vue`、`app/assets/css/main.css`

## 背景

重设计后，Nuxt 默认错误页（英文、无导航、与站点风格不一致）在静态托管上显得突兀。GitHub Pages 会把未知路径交给 `404.html`，因此错误页是用户实际会看到的页面之一，需要与站点视觉一致，并提供返回首页的出口。

## 选项

1. 保留 Nuxt 默认错误页。
2. 只用 `nuxt.config.ts` 的 `app.head` 注入样式，不替换组件。
3. 新建 `app/error.vue`，复用 `TopBar` / `FooterBar` 与卡片样式，按状态码显示中文文案。

## 决策

选择方案 3：

- `app/error.vue` 接收 `NuxtError`，用 `statusCode` 区分 404 与其他错误，分别显示「页面走丢了」与「出了一点问题」。
- 页面结构与站点一致：`TopBar` + 居中的 `.app-card` + `FooterBar`，404 数字使用 `.text-gradient`。
- 「回到首页」调用 `clearError({ redirect: '/' })`，确保清除错误状态后再导航；另提供「浏览文章」链接。
- `useSeoMeta` 设置 `robots: 'noindex'`，避免错误页被索引。
- 静态构建会生成 `404.html`，由 GitHub Pages 直接返回；页面内的 `TopBar` 链接仍走 baseURL。

## 后果

- 404 与 500 页面与站点风格统一，中文文案更友好。
- 直接访问 `/404.html` 时，Nuxt 会把它当作真实 404 处理，控制台出现一条预期的 `[NUXT_E1005]`（`app:error` 钩子），这不是渲染失败；页面内容与按钮均正常。
- 错误页依赖 `TopBar` / `FooterBar`，这两个组件必须保持不依赖页面级数据，否则错误页会二次报错。
- 后续若增加多语言，错误页文案需要同步抽取。
