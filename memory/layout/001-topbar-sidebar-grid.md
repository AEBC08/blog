# 顶部导航与双栏主网格

- 日期：2026-11-07
- 状态：**已废弃**（由 [002 Fuwari 信息架构 + HyperOS 视觉重设计](002-fuwari-hyperos-redesign.md) 取代）
- 相关文件：`app/layouts/default.vue`、`app/components/layout/TopBar.vue`、`app/components/layout/MainGrid.vue`、`app/components/sidebar/*`

> 保留原因：记录了最初的双栏网格与 `MiuixTopAppBar` 方案。`TopBar` 现已改为自定义玻璃导航，侧边栏顺序与视觉令牌也已在 002 中重做；本文仅作为历史决策参考。

## 背景

Fuwari 的信息架构是「顶部导航 + 侧边栏模块 + 主内容」，但项目要求布局形态与 miuix-vue 视觉融合，不要求复刻其 Astro/Svelte 实现或固定 17.5rem 列宽。

## 选项

1. 复刻 Fuwari 的三栏网格与精确尺寸。
2. 用 Tailwind Grid 实现自适应双栏，侧边栏宽度在 18–19rem，移动端单列。
3. 完全使用 miuix 布局组件（缺少等价网格容器）。

## 决策

选择方案 2：

- 桌面 `lg:grid-cols-[minmax(0,1fr)_18rem]`，宽屏 `xl:...19rem`；主内容 `minmax(0,1fr)` 防止横向溢出。
- 父级 `items-start`，侧边栏 `lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto`。
- 移动端天然单列；侧边栏写在 `<main>` 之后，因此自动下移。
- 顶部导航用 `MiuixTopAppBar`（SSR 安全），外层自己加 `sticky top-0` + 毛玻璃背景；TopAppBar 传 `color="transparent"`。
- 移动端导航放在 TopAppBar 的 `bottom` slot，横向滚动。
- 侧边栏 widget 使用 `MiuixCard`；卡片内用 Tailwind 原子类排版。

## 后果

- 列宽符合 miuix 视觉密度，不锁定 17.5rem。
- 文章页 TOC 由 `TocWidget` 在 `/blog/*` 路由下条件渲染，宽屏不额外增加第三栏。
- miuix 的 `.m-card` 自带背景/圆角，内层不要再套重复卡片背景。
