# Mermaid 改用生成主题：`themeCSS` 接管配色，保留形状几何

- 日期：2026-11-08
- 状态：采纳
- 相关文件：`nuxt.config.ts`、`app/assets/css/main.css`、`content/blog/markdown-showcase.md`

## 背景

[markdown/004](004-code-copy-and-mermaid-miuix.md) 为了让 Mermaid 与 miuix 表面一致，在 `main.css` 里用 `!important` 覆盖了节点、边、子图与时序图元素，并给所有节点矩形写了 `rx/ry: 10px`。这带来两个问题：

1. 覆盖规则是「一刀切」的：Mermaid 为不同形状生成的 `rx`/`ry` 被统一改掉，放大后直角矩形 `[]` 与圆角矩形 `()` 看起来一样，形状语义丢失。
2. 用户明确要求 Mermaid 通过它自己的生成主题/配置来样式化，而不是在站点 CSS 里大范围覆盖。

## 选项

1. 继续在 `main.css` 里覆盖节点/边/子图，只把 `rx/ry` 规则删掉。
2. 通过 `contentMermaid.loader.init.themeVariables` 传入颜色与圆角。
3. 通过 `contentMermaid.loader.init.themeCSS` 注入一段主题 CSS，颜色读取 `var(--app-*)`，不覆盖形状几何；同时删除 `main.css` 中的节点/边规则。

## 决策

选择方案 3：

- 在 `nuxt.config.ts` 新增 `MERMAID_THEME_CSS`，由 `contentMermaid.loader.init.themeCSS` 注入。规则覆盖：
  - 节点 `rect/circle/ellipse/polygon/path/.label-container`：`fill: var(--app-card)`、`stroke: var(--app-border-strong)`、`stroke-width: 1px`、`filter: none`。
  - 节点/边标签：`fill: var(--app-text)`、字重 500。
  - 边、箭头、子图、时序图 actor/message/note、类图、状态图、甘特图、饼图等使用 `--app-*` 令牌。
- **不写任何 `rx`/`ry` 规则**。Mermaid 自己生成的 `rx`/`ry` 属性保留：`[]` 无圆角、`()` 为 `rx="5"`、`([])` 是 stadium path、`(())` 是 circle、`{}` 是 polygon，放大后仍可区分。
- 删除 `main.css` 中所有 Mermaid 节点/边/子图/时序图颜色与几何覆盖，只保留容器、工具栏、滚动、圆角外框等布局规则。
- 保留 `theme: 'default'`、`flowchart.curve: 'linear'`、`useMaxWidth: false`、`nodeSpacing: 40`、`rankSpacing: 50`、`padding: 12` 与 MiSans 字体栈。
- 不使用 `themeVariables`：`@barzhsieh/nuxt-content-mermaid` 的 `RuntimeMermaidConfig` 会把 Mermaid 的 `any` 类型 `themeVariables` 映射为 `never`，无法通过 `loader.init` 传入；`themeCSS` 是当前可用的配置路径。

## 后果

- Mermaid 的配色仍然跟随明暗主题，因为 `var(--app-*)` 在宿主文档里解析；节点填充、描边、边线、子图、时序图都保持扁平。
- 形状语义恢复：实测 `[]` 的 `rect` 没有 `rx`，`()` 的 `rect` 为 `rx="5"`，`([])` 为 `path`，`(())` 为 `circle`，`{}` 为 `polygon`；放大后仍能区分。
- 计算样式验证：暗色节点 `fill: rgb(31, 31, 31)`、`stroke: rgb(69, 69, 69)`、`filter: none`，边线 `rgb(127, 132, 141)`，没有 `url(#...gradient)` 填充。
- Mermaid 仍会在 SVG 里生成 `linearGradient` / `dropShadow` 定义，但节点 CSS 的 `fill` 与 `filter` 覆盖了实际绘制；如果以后要求「SVG 内完全不出现渐变定义」，需要改用 `theme: 'base'` + 自定义主题变量或后处理，不能靠 `themeCSS` 删除 `<defs>`。
- `themeCSS` 在 Mermaid 命名空间化的图表样式之前注入，颜色规则需要 `!important` 才能压过图内默认值；形状属性不受影响。
- 升级 `@barzhsieh/nuxt-content-mermaid` 或 Mermaid 主版本后，必须重新检查 `themeCSS` 是否仍被注入、类名是否变化，以及形状 `rx/ry` 是否仍由 Mermaid 生成。
- `main.css` 不再承担 Mermaid 图形配色，后续调整图表颜色应改 `nuxt.config.ts` 的 `MERMAID_THEME_CSS`，避免两处规则互相覆盖。
