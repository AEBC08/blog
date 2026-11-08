# KaTeX、Shiki、Mermaid 与 MDC

- 日期：2026-11-07
- 状态：采纳
- 相关文件：`nuxt.config.ts`、`content/blog/markdown-showcase.md`、`app/components/content/*`

## 背景

博客需要数学公式、代码高亮、Mermaid 图表与 MDC 组件，并要避免 Nuxt Content v3 的已知渲染限制。

## 选项

1. Markdown 使用 ```math 围栏 + remark-math。
2. 使用 `$...$` / `$$...$$` + remark-math + rehype-katex。
3. 自建渲染管线。

## 决策

- 使用 `$...$` / `$$...$$`，配置：
  - `remarkPlugins: { 'remark-math': {} }`
  - `rehypePlugins: { 'rehype-katex': { output: 'html' } }`
  - `css` 引入 `katex/dist/katex.min.css`
- 明确不支持 ```math 围栏：在 Nuxt Content v3 中它会被当成 `ProseCode`，remark-math 不生效。此限制写进 README。
- Shiki：
  - `highlight.theme = { default: 'github-light', dark: 'github-dark' }`
  - `langs` 只列实际使用：ts/js/vue/bash/json/css/html/md/yaml
  - 在 `main.css` 增加 `.dark .shiki` 使用 `--shiki-dark*` 变量的规则
- Mermaid：
  - 使用 `@barzhsieh/nuxt-content-mermaid` 4.0.1，模块注册即可，不手动 `<ClientOnly>`
  - `contentMermaid.theme = { light: 'default', dark: 'dark' }`
  - 通过 `useMermaidTheme().setMermaidTheme('dark' | 'light')` 跟随本站主题
- MDC：
  - `Callout.vue`：`type: info|tip|warning|danger`
  - `Spoiler.vue`：基于 `<details>`
  - `LinkCard.vue`：模板整体包 `<ClientOnly>`，并给 fallback 骨架
  - `InteractivePost.vue`：`layout: interactive` 时由文章页分支渲染

## 后果

- 所有内容组件必须放 `app/components/content/`，Content 会以无前缀方式全局注册。
- 若 Mermaid 图表主题不随切换更新，检查 `useTheme` 是否调用了 `setMermaidTheme`，以及 `contentMermaid` 配置是否生效。
- Shiki 双主题变量需在 build 后的 CSS 中确认未被 Tailwind 清理。
