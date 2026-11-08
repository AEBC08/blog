# 去除渐变与 AI 味：扁平色板、Fuwari 侧边栏与 miuix 滑块

- 日期：2026-11-08
- 状态：采纳
- 相关文件：`app/assets/css/main.css`、`app/components/layout/*`、`app/components/sidebar/ProfileWidget.vue`、`app/components/post/PostCard.vue`、`app/components/content/LinkCard.vue`、`app/components/content/InteractivePost.vue`、`app/pages/*`、`app/error.vue`、`public/banner.svg`、`public/covers/*.svg`、`public/favicon.svg`、`nuxt.config.ts`

## 背景

用户明确反馈「不要使用渐变色，渐变色使得 AI 味很重」，并要求整体去除 AI 味；同时指出侧边栏（博主信息与标签栏）的固定方式「感觉怪怪的」，希望参考 Fuwari。另有三个具体诉求：Mermaid 图表要符合 miuix 设计、代码块右上角要有隐藏的复制按钮、滑块要改成 miuix 风格。

对照 Fuwari 实际站点（`https://blog.lenmei233.top`）后确认：

- Fuwari 的侧边栏是 `position: sticky; top: 1rem`，但它的侧栏内容比本站短；本站 Profile + TOC + 分类 + 标签叠加后高度经常超过视口。
- 原实现同时使用 `lg:sticky`、`max-height` 与 `overflow-y: auto`，在短视口下会出现侧栏内部滚动条，观感割裂。
- 蓝紫渐变、玻璃拟态、极光背景、渐变文字与彩色阴影是「AI 生成页面」的典型视觉特征；成熟设计系统大多是扁平的。

## 选项

### 配色与表面

1. 保留渐变，只降低饱和度。
2. 彻底移除渐变、玻璃拟态与彩色阴影，改用中性灰底 + 单一强调色 + 1px 描边。

### 侧边栏固定

1. 继续 `sticky + max-height + overflow-y: auto`。
2. 只在视口足够高时启用 `sticky`，否则回到普通文档流。
3. 完全照搬 Fuwari 的 `sticky top-4`，接受短视口下内容被裁切。

### 滑块

1. 使用原生 `input[type=range]` 自绘。
2. 保留 `MiuixSlider`，仅用 `.demo-slider` 覆盖轨道与滑块变量。

## 决策

### 扁平色板

- 明色：背景 `#f2f3f5`、卡片 `#ffffff`、主色 `#3482ff`。
- 暗色：背景 `#121212`、卡片 `#1f1f1f`、主色 `#6ea8ff`。
- 删除 `--app-accent`、`--app-cyan`、`--app-pink`，以及 `.glass`、`.text-gradient`、body 径向渐变、卡片渐变遮罩、按钮渐变与彩色阴影。
- 卡片统一为「纯色表面 + 1px `--app-border` + 轻阴影」；`widget-title` 与文章 H2 的竖条改为纯 `--app-primary`。
- 正文链接从渐变下划线改为常规 `text-decoration`；引用块、行内代码、表头、表格 hover 全部回落到 `--app-bg-soft`。
- 移除 `Latest`、`Explore`、`Archive`、`Article`、`Featured`、`End of article` 等英文微标签，改为「最新」「分类」「归档」「文章」「精选」「文章结束」等中文短标签。
- `public/banner.svg`、`public/covers/*.svg`、`public/favicon.svg` 全部重绘为纯色深底 + 网格线 + 单一蓝色强调，不含渐变、模糊或滤镜。

### 侧边栏

- `MainGrid` 的 `<aside>` 改为 `.app-sidebar`，删除 `max-height` / `overflow-y`。
- `main.css` 仅在 `@media (min-width: 1024px) and (min-height: 900px)` 下设置 `position: sticky; top: 6rem; align-self: start`。
- 视口较矮时不固定，侧栏随页面滚动，保证 TOC 与标签始终可达。
- `ProfileWidget` 改为 Fuwari 式居中卡片：无横幅、无渐变，头像 64px 方圆形，链接居中换行。

### 滑块与交互组件

- `InteractivePost` 的「渐变背景」改名「强调色背景」，开关只切换 `bg-app-primary-soft` 与 `bg-app-surface-container`。
- `MiuixSlider` 增加 `.demo-slider`：轨道用 `--app-bg-soft`，填充与滑块用 `--app-primary`，滑块加 1px 级阴影；不再自绘原生 range。
- `BackToTop` 外层从 `.glass` 改为 `.app-card`，保持圆形。

## 后果

- 页面不再出现任何 CSS 渐变；`grep -R "gradient"` 在 `app/` 与 `public/` 下均为 0 命中。
- 侧边栏在 1440×1000 下 `position: sticky`、`top: 96px`；在 390×844 下为 `static`，且页面无横向溢出。
- 矮视口（<900px 高）不会出现侧栏内部滚动条，但侧栏也不会固定在视口。
- 扁平化降低了视觉噪声与合成开销，也牺牲了原先「极光」首页的记忆点；后续若需品牌感，应通过排版与单一强调色而非渐变实现。
- 色板只保留一个强调色，新增语义色时必须显式加入 `--app-*` 与 Tailwind `@theme` 映射。
- 侧边栏固定依赖视口高度断点，若后续增加 widget 高度，需要同步调高 `min-height` 阈值。
