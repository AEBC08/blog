# 主题色回到 miuix 默认，并拆分文字强调色

- 日期：2026-11-08
- 状态：采纳
- 相关文件：`app/assets/css/main.css`、`app/**/*.vue`、`public/banner.svg`、`public/favicon.svg`、`public/covers/*.svg`

## 背景

站点暗色主题的强调色是 `#6ea8ff`，比 miuix-vue 的默认暗色 primary 更浅、更粉，用户觉得「感觉怪怪的」，希望回到 miuix 默认主题色。

miuix-vue 的默认值：

- 浅色：`--m-color-primary: #3482ff`，`--m-color-tertiary-container: #eaf2ff`
- 暗色：`--m-color-primary: #277af7`，`--m-color-tertiary-container: #2b3b54`

## 选项

1. 保留 `#6ea8ff`，只调整局部组件。
2. 直接把 `--app-primary` / `--app-primary-soft` 对齐 miuix 默认值。
3. 引入完整的主题色自定义面板，让用户运行时切换强调色。

## 决策

选择方案 2：

- 浅色：`--app-primary: #3482ff`（原本已一致），`--app-primary-soft: #eaf2ff`（对齐 miuix tertiary-container）。
- 暗色：`--app-primary: #277af7`，`--app-primary-soft: #2b3b54`。
- `--m-color-primary` / `--m-color-tertiary-container` 继续引用上述 `--app-*` 令牌，因此 miuix 组件自动同步。
- 静态 SVG（banner、favicon、封面）继续使用 `#3482ff`，与浅色主题一致；它们在暗色背景上仍然可读。
- 新增文字专用令牌 `--app-primary-text`：
  - 浅色 `#2569d6`，在 `--app-primary-soft` 上对比度 4.58:1、在白底上 5.16:1。
  - 暗色 `#8ab4ff`，在 `--app-primary-soft` 上 5.42:1、在卡片 `#1f1f1f` 上 7.89:1。
  - 所有 `text-app-primary` 用法改为 `text-app-primary-text`；正文链接、`.chip`、列表 marker 与代码复制按钮的 `color` 同步改用该令牌。
  - `--m-color-on-tertiary-container` 与 `--color-app-on-primary-container` 映射到该令牌，miuix 组件里的文字同步变可读。
  - `bg-app-primary`、边框、圆点、进度条等填充场景仍使用 `--app-primary`，保持 miuix 默认色。

## 后果

- 填充色仍是 miuix 默认 primary，文字与图标改用独立令牌后，浅色与暗色下都达到 4.5:1 以上；不再需要在「品牌色准确」和「文字可读」之间取舍。
- 主题色现在是 miuix 默认值，升级 miuix-vue 时不需要重新校准强调色。
- 未实现顶栏的「自定义选项弹窗」；如果后续要做，应在现有 `ThemeToggle` 基础上扩展，避免重复一套主题状态。
