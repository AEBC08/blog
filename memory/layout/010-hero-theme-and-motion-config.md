# 010 首页横幅：明暗双版本、组件化与可配置动效

## 背景

首页 hero 原本内联在 `app/pages/index.vue`：背景固定 `public/banner.svg`（深色），文字全部硬编码白色，统计项写死在模板里，动画只有一层 `animate-fade-up`。因此浅色主题下仍是一块黑色大图，无法跟随主题，也没有逐项动效。协作方的第一项任务是「为黑色大图制作白色版本，同时增加更多配置」，并明确「配置」指站点名称、页脚这类站点级信息独立出来（见 architecture/006）。

## 选项

1. 只新增一张白色 SVG，用 `useTheme().isDark` 在 JS 里切换 `<img src>`；水合前后会闪一下错误配色，与 ssr/001 的 FOUC 约束冲突。
2. 保留图片方案，用两张 `<img>` 叠加 + CSS 变量控制 opacity，由 `.dark` class 决定显隐；无闪烁，但网格 / 字母 / 光晕都在 SVG 内，无法单独开关或动画。
3. 抽成 `HeroBanner.vue`，配色由 `--hero-*` 令牌驱动（首屏无闪烁），装饰改为 DOM / 内联 SVG 逐项渲染；同时保留两张 SVG 作为可选 `image` 背景模式。

## 决策

选 3，并让 `hero.background` 在 `gradient`（默认）与 `image` 之间切换：

- `public/banner-light.svg` 新增白色底图，与深色 `public/banner.svg` 构图对称；两张图都去掉写死的品牌文字与蓝条，改由组件渲染。
- 配色在 `main.css` 的 `:root` / `.dark` 定义 `--hero-*` 令牌；`@theme inline` 映射 `--color-hero-*` 以便 Tailwind 类读取局部令牌。`hero.appearance` 为 `light` / `dark` 时，用 `:root .hero-surface-dark` 与 `.dark .hero-surface-light` 在组件根覆盖整套调色板，可与全局主题相反。
- 背景图显隐用 `--hero-bg-light-opacity` / `--hero-bg-dark-opacity`，纯 CSS 决策，配合 head 主题脚本无闪烁。
- hero 抽为 `app/components/layout/HeroBanner.vue`，`index.vue` 只传三个计数；文案、按钮、统计项、装饰开关、动效参数全部来自 `site.config.ts` 的 `hero`。
- 动效：`hero-enter` 按 `--hero-i` 分段 stagger；背景渐显缩放、字母描边渐显、蓝条生长、光晕漂浮、鼠标视差（直接写 DOM CSS 变量，避免逐帧响应式更新）、统计数字 count-up（SSR 先输出最终值保证水合一致，挂载后从 0 滚动）、按钮悬停位移。`preset` 为 `subtle` / `standard` / `playful`，`playful` 换用带 blur + scale 的 keyframes。`motion.enabled` 与 `prefers-reduced-motion` 都能整体关闭动画。
- 悬停位移放在内层 `<NuxtLink>`，入场动画放在外层 wrapper，避免 `animation-fill-mode: both` 的 transform 覆盖 hover。
- 装饰字母与蓝条合并到一个定位 SVG（`viewBox="0 0 320 380"`，`preserveAspectRatio="xMidYMid meet"`），取代原来整幅 `1600×720` + `slice` 的做法：后者在宽屏容器里会被裁切，导致 A 的右腿压到统计数字。

## 后果

- 浅色主题得到白色 hero，深色主题保留黑色 hero，两种模式都用真实浏览器截图验证过；`image` 模式也验证过白色 SVG 正常显示。
- 动效参数集中在 `hero.motion`，节奏以 CSS 自定义属性传给 keyframes，改数值不需要碰组件或样式。
- `image` 模式下装饰由 SVG 提供（网格 / A / 蓝条来自图片），因此该模式不渲染 DOM 装饰层，避免重影；品牌小字与蓝条例外，两种模式都由配置渲染。
- 浅色网格与光晕对比度经过一轮收敛：网格改为 `#eef1f6` 且叠层 `opacity: 0.7`，光晕降到 7% 透明度，避免白底上的网格线抢眼。
- 未来若给顶栏加「自定义选项弹窗」（architecture/002 的遗留待办），可直接把 `hero.appearance` / `hero.motion.preset` 接到运行时覆盖层，无需重构组件。
