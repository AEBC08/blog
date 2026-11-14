# 011 全局视觉动效：页面过渡、滚动进度条与内容渐显

**日期**：2026-11-14
**状态**：已实现

## 背景

首页横幅（memory/layout/010）做完后，页面级动效仍是空白：路由切换是硬切、阅读时没有进度指示、列表卡片一次性全部出现。需要一套与站点主题令牌打通、可整体开关的页面级动效。

## 选项

- **页面过渡**：Nuxt 内置 `pageTransition`（Vue `<Transition>`）vs View Transitions API。后者需要 `experimental.viewTransition` 且跨文档行为差异大，最终选前者——SSR 友好、零依赖。
- **进度条**：rAF 节流监听 scroll 改 `transform: scaleX`（合成层，无重排）vs 直接改 `width`（每次触发重排）。选 scaleX。
- **滚动渐显**：自定义 `v-reveal` 指令 + IntersectionObserver vs 纯 CSS `animation-timeline: view()`。后者兼容性不够（Firefox/Safari 未普及）。

## 决策

1. `nuxt.config.ts` 开启 `app.pageTransition: { name: 'page', mode: 'out-in' }`，过渡类写在 `main.css`（`.page-enter-*` / `.page-leave-*`）；开关 `effects.pageTransition` 在**构建期**读取，关闭时不出过渡类。
2. 新增 `app/components/layout/ScrollProgress.vue`：固定在视口顶部 z-[70]、2px、`--app-primary → --app-primary-text` 渐变，`scaleX` 驱动，进度 >0 时才显示，挂在 `layouts/default.vue` 顶部。
3. 新增 `app/plugins/reveal.ts` 注册 `v-reveal` 指令（含 `getSSRProps` 避免 SSR 警告）：mounted 时才加 `.reveal` 隐藏类（无 JS / SSR 内容始终可见，不白屏），IntersectionObserver 触发 `.reveal-visible`，支持 `{ delay }` 错峰。开关 `effects.reveal`。
4. 应用位置：`PostList` 卡片按 60ms 错峰（封顶 360ms）、`SidebarPanel` 四个 widget（50ms 递增）、首页精选卡/最新文章区/分类卡。
5. 顶栏贴附态：`TopBar.vue` 监听滚动（rAF 节流），滚过 16px 后给 `.m-card` 加深阴影（`.topbar-scrolled`）。
6. 细节打磨：`::selection` 用品牌色、`scrollbar-width`/`::-webkit-scrollbar` 主题化细滚动条。
7. 所有新动效在 `@media (prefers-reduced-motion: reduce)` 下禁用；开关集中在 `site.config.ts` 的 `effects` 分组。

## 后果

- 路由切换从硬切变为淡出淡入（out-in，约 0.22s），阅读多篇文章时体验更连贯。
- 进度条与渐显全部走 CSS 变量令牌，明暗主题自动适配，无需 JS 判断主题。
- `v-reveal` 隐藏态由 JS 加类，代价是首帧可能有一次从隐藏到显现的动画（首屏卡片），与设计预期一致。
- `effects.pageTransition` 是构建期开关，改它需要重新构建；另外两个是运行时开关。
- 若未来文章页很长且含锚点跳转，`out-in` 模式下滚动位置由 Nuxt 默认 scrollBehavior 处理，需留意锚点场景（目前未使用跨页锚点）。
