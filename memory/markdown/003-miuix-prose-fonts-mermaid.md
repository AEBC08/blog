# Markdown 组件统一：Miuix Checkbox、表格、Maple Mono 与 Mermaid

- 日期：2026-11-08
- 状态：部分废弃（Mermaid 字体与 `flowchart`/`sequence` 配置、表面令牌已被 [004](004-code-copy-and-mermaid-miuix.md) 更新；任务列表、表格与 Maple Mono 等宽字体仍有效）
- 相关文件：`app/components/content/ProseLi.vue`、`app/components/content/ProseTable.vue`、`app/assets/css/main.css`、`nuxt.config.ts`

## 背景

Markdown 渲染出的 GFM 任务列表、表格和 Mermaid 图表与站点其余 miuix-vue 界面风格割裂：

- GFM 任务列表输出原生 `<input type="checkbox">`，与 miuix-vue 的圆形 `MiuixCheckbox` 不一致。
- 表格是裸 `<table>`，没有卡片圆角、分隔线和横向滚动容器。
- Mermaid 使用模块默认的 Arial 字体与默认主题，工具栏仍是英文，宽流程图会被压缩到容器宽度，标签过小。
- 代码块与行内代码仍使用系统等宽字体，英文与中文的回退不统一。

参考对象为 miuix-vue 官方 demo（<https://yukonga.github.io/miuix-vue>）与 Fuwari（<https://blog.lenmei233.top>）。

## 选项

### 任务列表

1. 保留原生 checkbox，只用 CSS 近似 miuix 圆形样式。
2. 在 `ProseLi` 中把 `<input type="checkbox">` 节点替换为 `MiuixCheckbox`。

### 表格

1. 等待 miuix-vue 提供表格组件。
2. 用 `ProseTable` 包一层滚动容器，用 Tailwind/CSS 仿制 miuix 卡片表面。

### 等宽字体

1. 继续使用系统等宽字体。
2. 英文使用 Maple Mono，中文回退到 MiSans（miuix-vue 已加载）。

### Mermaid

1. 保留模块默认主题与 `useMaxWidth: true`。
2. 用 `--ncm-*` 令牌对接站点色板，中文工具栏，关闭 `useMaxWidth` 以保留图表固有宽度。

## 决策

- **任务列表**：选择方案 2。`ProseLi.vue` 使用 render function，检查子节点是否为 `input[type=checkbox]`，是则替换为 `h(MiuixCheckbox, { modelValue, disabled: true, class: 'prose-task-checkbox' })`。`inheritAttrs: false`，最终仍渲染 `<li>` 并透传 attrs。这样 Markdown 源文件无需改动。
- **表格**：选择方案 2。`ProseTable.vue` 输出 `.prose-table-wrap > table`，滚动、圆角、边框由外层负责；`main.css` 提供表头底色、行 hover、单元格分隔线。miuix-vue 目前没有表格组件，这是有意的 CSS 仿制。
- **等宽字体**：选择方案 2。引入 `@fontsource/maple-mono`，只加载 `latin-400.css` 与 `latin-700.css`（避免为 500/600 增加无谓体积），`--font-mono` 定义为 `'Maple Mono', 'MiSans', ...`。代码块开启 `liga` / `calt` 连字。
- **Mermaid**：
  - `contentMermaid.theme`：明色 `neutral`、暗色 `dark`。
  - `loader.init.fontFamily` 使用与 `--font-mono` 一致的字体栈。
  - `toolbar.title` 为「图表」，所有按钮 `labels` 改为中文。
  - `flowchart.useMaxWidth: false`、`sequence.useMaxWidth: false`，配合 `.mermaid-wrapper svg { max-width: none; width: auto }`，让宽图保留固有宽度（实测 1116px），由模块的 `overflow-x: auto` 横向滚动，而不是缩成 660px 导致标签不可读。
  - 用 `--ncm-code-bg`、`--ncm-border-color`、`--ncm-text-*` 等变量把模块表面接入 `--app-*` 色板。

## 后果

- Markdown 任务列表、表格、Mermaid 与站点 UI 视觉统一，源文件保持标准 GFM/Mermaid 语法。
- `ProseLi` 依赖 `@nuxtjs/mdc` 把 checkbox 渲染为 `input` 节点；若上游改为组件，需要重新适配。
- 关闭 `useMaxWidth` 后，宽图在窄容器内横向滚动，页面本身不会溢出。
- Maple Mono 仅含 Latin 字形，中文自动回退 MiSans；字体文件从 `nuxt_assets` 自托管，无第三方 CDN 依赖。
- Mermaid 主题变量与 `--app-*` 令牌耦合，调整色板时需同步检查图表可读性。
- 新增组件均在 `app/components/content/` 下，遵循 [002 Prose 覆盖路径](002-prose-override-path.md)。
- 同期补充的 Fuwari 交互细节（侧边栏标题竖条、回到顶部、上一篇/下一篇）见 [layout/003](../layout/003-fuwari-detail-polish.md)。

## 后续变更

2026-11-08 的 [004](004-code-copy-and-mermaid-miuix.md) 更新了本记录的 Mermaid 部分：

- `loader.init.fontFamily` 从 Maple Mono 栈改为 MiSans 栈；代码块仍使用 Maple Mono。
- `flowchart` 增加 `curve: 'linear'`、`nodeSpacing: 40`、`rankSpacing: 50`、`padding: 12`；`sequence` 增加 `actorMargin`、`boxMargin`、`mirrorActors`。
- 节点、边、子图、时序图元素改为 CSS `!important` 覆盖，使用卡片填充、1px 描边与 10px 圆角。
- 任务列表 `ProseLi`、表格 `ProseTable`、Maple Mono 字体与中文工具栏仍然有效。

2026-11-08 的 [006](006-mermaid-generated-theme.md) 进一步把节点/边配色迁移到 `contentMermaid.loader.init.themeCSS`，并移除了 `main.css` 中的 `rx/ry: 10px` 覆盖，恢复 Mermaid 自己的形状几何。
