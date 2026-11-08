# 代码块隐藏复制按钮与 Mermaid 的 miuix 化

- 日期：2026-11-08
- 状态：部分废弃（代码复制按钮仍然有效；Mermaid 外框的工具栏、标题与阴影被 [markdown/005](005-mermaid-outer-frame.md) 重做，节点/边 CSS 覆盖被 [markdown/006](006-mermaid-generated-theme.md) 取代）
- 相关文件：`app/components/content/ProsePre.vue`、`app/assets/css/main.css`、`nuxt.config.ts`、`content/blog/markdown-showcase.md`

## 背景

在 [layout/004](../layout/004-flat-design-and-sidebar.md) 的扁平化之后，还有两处 Markdown 渲染结果与 miuix 界面不一致：

- 代码块没有复制入口，读者需要手动选中代码。
- Mermaid 使用模块默认的 `dark` 主题：节点是深灰直角矩形、边线偏亮、字体回退到系统字体，与站点的圆角卡片、1px 描边和 MiSans 不协调。

同时用户要求复制按钮「右上角、默认隐藏」，避免常驻控件干扰阅读。

## 选项

### 复制按钮

1. 在 `ProseCode` 上包一层，按钮放进可滚动的 `<pre>` 内部。
2. 新增 `ProsePre` 覆盖，外层 `.prose-code` 负责定位，按钮与 `<pre>` 同级。
3. 使用现成的第三方复制插件。

### Mermaid 风格

1. 保留模块主题，仅改字体。
2. 用模块暴露的 `themeVariables` 配置。
3. 保留模块主题作为兜底，再用 CSS 覆盖节点、边、子图、时序图元素。

## 决策

### 复制按钮

- 选择方案 2。新增 `app/components/content/ProsePre.vue`，保留 Shiki 生成的 `<pre><code>` 结构，外包 `.prose-code`，右上角放 `.prose-copy`。
- 按钮默认 `opacity: 0`，`.prose-code:hover` 或 `:focus-visible` 时显示；`@media (hover: none)` 下常显，兼顾触屏。
- 复制内容优先读取 `preRef.value?.querySelector('code')?.textContent`，回退到 `props.code`。
- 优先 `navigator.clipboard.writeText`，失败时用隐藏 `<textarea>` + `document.execCommand('copy')` 兜底。
- 复制成功后切换为对勾图标并加 `.is-copied`，1.6s 后恢复；组件卸载时清理定时器。
- 外层 `.prose-code` 承担 `margin-block`，`<pre>` 的 `margin-block` 归零并增加右侧内边距，避免按钮遮挡代码。

### Mermaid

- 选择方案 3。`contentMermaid.loader.init` 的 `fontFamily` 改为 MiSans 字体栈（代码块仍用 Maple Mono）；`flowchart` 使用 `curve: 'linear'`、`nodeSpacing: 40`、`rankSpacing: 50`、`padding: 12`；`sequence` 设置 `actorMargin: 50`、`boxMargin: 10`、`mirrorActors: false`。
- 保留 `useMaxWidth: false` 与 `.mermaid-wrapper` 的横向滚动，宽图不压缩。
- 模块会把内部样式以 ID 选择器注入 SVG，因此覆盖必须使用 `!important`：
  - 节点 `rect/circle/ellipse/polygon/path`：`fill: var(--app-card)`、`stroke: var(--app-border-strong)`、`stroke-width: 1px`；矩形 `rx/ry: 10px`。
  - 节点与边标签：`fill: var(--app-text)`，字重 500。
  - 边与箭头：`stroke/fill: var(--app-text-faint)`，线宽 1.2px。
  - 子图 `cluster rect`：`fill: var(--app-bg-soft)`、1px 描边、12px 圆角。
  - 时序图 actor、actor-line、messageLine、messageText、note、noteText 同步接入 `--app-*`。
- 图表容器表面：`.mermaid-block` 用 `--app-card`，`.mermaid-wrapper` 用 `--app-bg-soft`，工具栏保持卡片色。

## 后果

- 代码复制在桌面悬停可见、触屏常显；无第三方依赖。
- `ProsePre` 覆盖了 MDC 默认的 `<pre>`，若上游改变 Shiki 输出结构（例如不再用 `<code>` 包裹），需要重新检查取值逻辑。
- `execCommand` 已被标记废弃，但在非安全上下文或权限被拒时仍是有效兜底。
- Mermaid 的颜色覆盖依赖模块内部类名（`.node`、`.edgePath`、`.cluster` 等）与 `!important`，升级 `@barzhsieh/nuxt-content-mermaid` 后需要重新验证。
- Mermaid 字体改为 MiSans 后，图中英文与代码块字体不再一致；这是为了让图表更像 UI 而不是代码。
- 复制按钮与 Mermaid 覆盖都只影响渲染层，Markdown 源文件仍是标准围栏语法。

## 后续修订（2026-11-08）

[006](006-mermaid-generated-theme.md) 取代了本记录的 Mermaid 节点/边/子图 CSS 覆盖：

- 删除 `main.css` 中的 `.node`、`.edgePath`、`.cluster`、`.actor` 等规则与 `rx/ry: 10px`。
- 配色与字体改由 `contentMermaid.loader.init.themeCSS` 注入，保留 Mermaid 自己生成的形状几何。
- 代码复制按钮部分仍然有效。
