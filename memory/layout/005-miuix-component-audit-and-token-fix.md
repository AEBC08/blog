# miuix-vue 组件审计、暗色描边根因与缺失令牌

- 日期：2026-11-08
- 状态：采纳
- 相关文件：`app/assets/css/main.css`、`app/components/layout/TopBar.vue`、`app/components/layout/BackToTop.vue`、`app/pages/blog/index.vue`、`app/pages/blog/[...slug].vue`、`app/pages/index.vue`、`app/error.vue`、`app/components/post/PostList.vue`、`app/components/post/PostCard.vue`、`app/components/sidebar/ProfileWidget.vue`、`app/components/sidebar/TocWidget.vue`、`app/components/content/InteractivePost.vue`

## 背景

用户要求「能使用 miuix-vue 组件的地方尽量使用」，并明确把暗色模式下的亮色/白色描边视为 bug。排查后发现两个独立问题：

1. `border-app-border`、`bg-app-card`、`bg-app-border-strong` 等 Tailwind 类被使用，但 `@theme inline` 中缺少 `--color-app-border`、`--color-app-card`、`--color-app-border-strong` 映射。Tailwind 对未知颜色生成 `border-color: currentColor` 或直接不生成背景，暗色下就出现亮色描边。
2. `MiuixCard` 渲染 `.m-card-wrapper > .m-card`，传入的 `class` 落在 wrapper 上，而内层 `.m-card` 是 `flex-direction: column; overflow: hidden`。把布局类直接写在 `MiuixCard` 上不会作用于内层卡片，popover 也会被裁切。

## 选项

### 卡片与控件

1. 继续全部手写 `.app-card` + Tailwind。
2. 能替换的全部替换为 `MiuixCard` / `MiuixButton` / `MiuixIconButton` / `MiuixSearchBar` / `MiuixSwitch` / `MiuixSlider` / `MiuixText` / `MiuixDivider`，只在需要完全控制外壳时保留 `.app-card`。
3. 只替换按钮，卡片保持手写。

### 描边修复

1. 在组件上逐个写 `border-[color]` 兜底。
2. 补齐 `--color-app-*` 映射，并把暗色边框改为实色中性灰。

## 决策

### 组件审计

选择方案 2：

- `TopBar`、博客归档头、首页分类区、文章容器与相邻文章导航、列表空状态、404 页面、`ProfileWidget`、`TocWidget`、`InteractivePost` 使用 `MiuixCard`。
- 博客搜索从手写 `<input>` 改为 `MiuixSearchBar`（`v-model` + `label`），并用 `.blog-search` 压缩到归档头尺寸。
- 404 主按钮与交互示例按钮使用 `MiuixButton`；主题/回到顶部使用 `MiuixIconButton`。
- `MiuixCard` 内的布局与内边距放在内层 `<div>`；`TopBar` 用 `.topbar-card .m-card { overflow: visible }` 让主题菜单溢出。
- `BackToTop` 保留 `.app-card`：`MiuixCard` 的 wrapper 让 pill 圆角与外层内边距不自然。

### 令牌修复

选择方案 2：

- 补齐 `--color-app-card`、`--color-app-card-hover`、`--color-app-border`、`--color-app-border-strong`，并同步 `--color-app-surface-container`、`--color-app-surface-high`。
- 暗色边框从 `rgb(255 255 255 / 0.08)`、`rgb(255 255 255 / 0.18)` 改为实色 `#2f2f2f`、`#454545`，避免半透明白在深底上发亮。
- 补齐 miuix 的 `--m-color-*` 映射（surface/container/disabled/slider/on-surface 变体），让搜索栏、卡片、滑块、禁用态都读取同一套 `--app-*`。

## 后果

- 暗色页面不再出现亮色描边；Playwright 扫描所有元素边框，未发现亮度 > 170 且 alpha > 0.05 的边框。
- 归档搜索栏为 256×40、14px 字号；TopBar 在桌面保持单行 58px 高。
- `MiuixCard` 的双层结构成为固定约束：新增卡片时，`class` 只影响 wrapper，布局必须放在内层内容；需要 popover 的卡片要显式放开内层 `overflow`。
- `.app-card` 仍用于 hero、BackToTop 与部分内容组件，不是所有表面都必须用 `MiuixCard`。
- 升级 miuix-vue 后需要复查 wrapper 结构、`--m-color-*` 名称与 `MiuixSearchBar` 的内部类名（`.blog-search` 覆盖依赖它们）。
