# LinkCard 图标背景色可配置，默认无背景

- 日期：2026-11-08
- 状态：待实现（交接）
- 相关文件：`app/components/content/LinkCard.vue`、`content/posts/markdown-showcase.md`

## 背景

`LinkCard` 的图标位固定是 `bg-app-primary` 方块 + `text-app-on-primary`，所有卡片看起来一样，而且图标库图标被强制放在主色底上。用户希望：使用图标库（而非图像）时能自定义图标背景色，默认**无背景色**。

## 选项

1. 继续固定主色底，只允许换图标名。
2. 新增 `icon-bg` prop，默认透明；只有传值时渲染背景色，图标颜色随之适配。
3. 提供一个预置色板枚举（primary / soft / muted / none）。

## 决策

选择方案 2：

- 新增 props：
  - `iconBg?: string`：任意 CSS 颜色（`#f5f5f5`、`rgb(...)`、`var(--app-bg-soft)` 均可），默认 `undefined`。
  - `iconColor?: string`：可选，默认继承 `--app-primary-text`，背景很深时可显式传 `#fff`。
- 默认（不传 `iconBg`）：图标容器 `background: transparent`，只保留尺寸与圆角，不再有主色方块。
- 传了 `iconBg`：容器内联 `:style="{ backgroundColor: props.iconBg, color: props.iconColor }"`，图标继承 `color`。
- 首字母兜底与图标库图标共用同一套容器样式，避免两种分支外观不一致。
- 纯色写进内联 style（而不是动态 Tailwind 类），因为 Tailwind 无法在构建期枚举任意颜色值。

## 后果

- 现有页面（`markdown-showcase.md` 中的两个 LinkCard）外观会从小蓝方块变成无底色图标，这是用户要的默认行为；如需保留旧观感，在 Markdown 里显式写 `icon-bg="var(--app-primary)" icon-color="#fff"`。
- `iconBg` 不做颜色校验，写错值只会让背景失效，不影响构建。
- 若要支持「图像图标」（`<img>`），应另加 `image?: string` prop 并在有图时跳过 `iconBg`，本记录暂不覆盖。
- 需要在 `markdown-showcase.md` 的 LinkCard 段落补一条带 `icon-bg` 的示例，方便作者复制。
