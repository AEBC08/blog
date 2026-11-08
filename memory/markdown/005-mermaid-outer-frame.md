# Mermaid 外框重做：隐藏标题、透明工具栏与特异性修复

- 日期：2026-11-08
- 状态：采纳
- 相关文件：`app/assets/css/main.css`、`nuxt.config.ts`、`content/blog/markdown-showcase.md`

## 背景

Mermaid 的图形内容与配色已经可接受，但外层「图表」框仍像一个独立 widget：模块自带标题栏、下边框、卡片底色与阴影，和扁平的 miuix 卡片放在一起显得突兀。用户要求只重做外框，不改变图形内容。

第一次覆盖时发现圆角与内边距没有生效：模块的 scoped 样式编译为 `.mermaid-block[data-v-…]`、`.mermaid-wrapper[data-v-…]`，与本站的 `.post-content .mermaid-block`、`.post-content .mermaid-wrapper` 同为两个类选择器（特异性 0,2,0），而模块 CSS 在构建产物中加载更晚，因此模块规则胜出。颜色变量之所以生效，是因为模块的 `--ncm-code-bg` 定义在 `:where(:root)`，特异性低于本站规则。

## 选项

1. 保留模块默认外壳，只替换颜色变量。
2. 隐藏标题、透明工具栏、去掉阴影与下边框、使用扁平软底，操作按钮右对齐并缩小。
3. 完全替换模块渲染器，自行绘制 Mermaid 容器。

## 决策

选择方案 2：

- `--ncm-code-bg: var(--app-bg-soft)`，块本身使用 `--app-bg-soft` 扁平底色。
- 隐藏 `.mermaid-title`（同时把 `contentMermaid.toolbar.title` 置空），只保留右侧操作按钮。
- 工具栏背景透明、去掉下边框，内边距压缩为 `0.45rem 0.45rem 0 0.75rem`。
- 块去掉阴影，圆角 `1rem`，边框颜色显式设为 `var(--app-border)`。
- 操作按钮 1.85rem 方形、透明背景，悬停时用文字色 8% 混合。
- wrapper 透明、内边距 `0.25rem 0.75rem 0.75rem`，保留横向滚动与滚动条颜色变量。
- 通过 `.post-content .mermaid-outer-wrapper .mermaid-block`（0,3,0）与 `.post-content .mermaid-block .mermaid-wrapper`（0,3,0）提升特异性，压过模块 scoped 规则。

## 后果

- Mermaid 现在是一个普通的内容块：无标题、无阴影、无独立卡片感，暗色下没有亮边或白框。
- 宽图仍保持固有宽度并横向滚动，移动端不撑破页面。
- 模块内部类名与 CSS 特异性是脆弱点；升级 `@barzhsieh/nuxt-content-mermaid` 后必须重新检查圆角、内边距、工具栏与标题是否仍然生效。
- 标题不再显示；如果以后需要图表说明，应写在正文里，而不是恢复模块 toolbar 标题。

## 后续修订（2026-11-08）

节点、边与子图的配色已由 [006](006-mermaid-generated-theme.md) 迁移到 `contentMermaid.loader.init.themeCSS`；本记录的外框、工具栏、圆角与横向滚动规则仍然有效。
