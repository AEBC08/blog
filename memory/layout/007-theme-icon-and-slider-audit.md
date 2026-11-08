# 系统主题图标改用 sun-moon，移除滑块多余阴影

- 日期：2026-11-08
- 状态：采纳
- 相关文件：`app/components/layout/ThemeToggle.vue`、`app/utils/icon-registry.ts`、`app/assets/css/main.css`、`content/posts/markdown-showcase.md`

## 背景

用户反馈两点视觉问题：

1. 「跟随系统」主题选项使用 `device-desktop` 图标，语义更像「桌面设备」，不像自动/系统主题。
2. 交互示例里的滑块出现了上游 miuix-vue 没有的阴影。用户同时要求：覆盖 miuix-vue 组件时不要添加不必要的样式。

## 选项

### 系统主题图标

1. 保留 `device-desktop`。
2. 改用 `brightness-auto` / `contrast` 等表示自动亮度的图标。
3. 改用 Tabler 的 `sun-moon`，同时表达浅色与深色两种模式。

### 滑块阴影

1. 保留自定义 `box-shadow`，让拇指更有层次。
2. 删除阴影，只保留颜色令牌覆盖，让 miuix-vue 自己绘制拇指。
3. 改用 `MiuixSlider` 的其它变体或完全自绘滑块。

## 决策

### 系统主题图标

选择方案 3：

- `ThemeToggle.vue` 中 `system` 选项的图标改为 `sun-moon`，触发按钮在系统模式下也显示 `sun-moon`。
- `app/utils/icon-registry.ts` 具名导入 `IconSunMoon`，并在 `TABLER_COMPONENTS` 中登记；kebab-case 名称由现有 `toKebabCase()` 自动生成。
- `content/posts/markdown-showcase.md` 的图标示例从 `device-desktop` 改为 `sun-moon`，文案改为「跟随系统」。

### 滑块阴影

选择方案 2：

- 删除 `main.css` 中 `.demo-slider .m-slider__thumb` 与 `.dark .demo-slider .m-slider__thumb` 的 `box-shadow` 规则。
- `.demo-slider` 只保留三个颜色令牌：`--m-color-slider-background`、`--m-color-primary`、`--m-color-on-primary`。
- 不覆盖 miuix-vue 内部的尺寸、圆角、阴影等非令牌样式。

## 后果

- 新增 Tabler 图标时仍必须在 `icon-registry.ts` 的具名导入与 `TABLER_COMPONENTS` 中各加一行；否则 SSR 会渲染兜底图标。
- 主题图标由 `html[data-theme-mode]` 与 CSS 类切换，`sun-moon` 必须在首屏渲染前已注册，避免图标闪烁或缺失。
- 覆盖 miuix-vue 组件时优先只改 CSS 变量；只有布局或明确的视觉缺陷才追加选择器，且需要在明暗两套主题下验证。
- 滑块现在完全使用上游拇指样式，后续升级 miuix-vue 时不需要重新校准阴影。
