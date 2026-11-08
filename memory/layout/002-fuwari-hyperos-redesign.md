# Fuwari 信息架构 + HyperOS 视觉重设计

- 日期：2026-11-07
- 状态：部分废弃（渐变、玻璃拟态、极光背景与彩色阴影已被 [004](004-flat-design-and-sidebar.md) 的扁平方案取代；信息架构与 `--app-*` 令牌体系仍有效）
- 相关文件：`app/assets/css/main.css`、`app/components/layout/*`、`app/pages/*`、`app/components/post/*`、`app/components/sidebar/*`、`app/components/content/*`、`public/banner.svg`、`public/covers/*.svg`、`nuxt.config.ts`

## 背景

初版虽然满足了 `project.md` 的功能与验收条件，但视觉上只是「miuix 组件 + Tailwind 排版」的默认拼装，用户明确反馈「感觉好丑啊」。参考对象有两个：

- `https://yukonga.github.io/miuix-vue`：miuix-vue / HyperOS 的视觉语言（柔和圆角、低对比底色、克制的主色）。
- `https://blog.lenmei233.top`：Fuwari 风格博客的信息架构（顶部导航、侧边栏模块、主内容卡片、文章目录）。

博客为个人使用，不需要多作者、复杂归档等重功能，重点是首页与阅读体验。

## 选项

1. 继续使用 `MiuixTopAppBar`，只调整颜色与间距。
2. 直接复刻 Fuwari 的 Astro/Svelte 布局与配色，放弃 miuix 组件。
3. 保留 miuix 组件与 Tailwind，重做信息架构和视觉层：自定义悬浮玻璃导航、统一 `--app-*` 色板、极光首页、卡片化文章页。

## 决策

选择方案 3。

### 布局与导航

- `TopBar` 不再使用 `MiuixTopAppBar`，改为 Tailwind 手写的悬浮玻璃条：`sticky top-0` + `.glass` + `rounded-2xl`，导航项做成胶囊高亮，`ThemeToggle` 仍是 `MiuixIconButton`。
- `MainGrid` 增加 `hero` 插槽，页面自己拥有 `MainGrid`；首页用 `hero` 放极光横幅，博客列表页不放。
- 桌面仍为 `lg:grid-cols-[minmax(0,1fr)_18rem]` / `xl:...19rem`，侧边栏 `lg:sticky lg:top-24`，移动端单列。
- 文章页侧边栏顺序调整为 Profile → TOC → Categories → Tags，保证目录在首屏折叠线以上。

### 视觉令牌

- `main.css` 定义 `--app-bg`、`--app-card`、`--app-text-*`、`--app-primary`、`--app-accent` 等明暗两套令牌，再用 `@theme inline` 映射为 `text-app-*`、`bg-app-*`、`border-app-*` 等 Tailwind 工具类。
- 同时覆盖 miuix 的 `--m-color-*` 令牌，让 `MiuixCard`、按钮、图标按钮与站点色板一致。
- CSS 加载顺序固定为 `katex` → `miuix-vue/style.css` → `~/assets/css/main.css`，否则 `--app-*` 覆盖不会生效。
- 背景使用多层径向渐变 + 噪点感的极光光斑，`.app-card` / `.app-card-hover` / `.glass` / `.chip` / `.text-gradient` / `.animate-fade-up` 作为共享表面与动效类。
- 字体使用 HyperOS 的 MiSans（`cdn-font.hyperos.mi.com`），在 `nuxt.config.ts` 中预连接并按需加载。

### 页面

- 首页：极光 hero（标题、tagline、状态、统计）、精选文章、分类浏览器。
- 博客列表：客户端搜索框 + 分类筛选 chip + 「共 N 篇」结果计数，缩略图桌面侧置、移动端 16:9。
- 文章页：整篇内容装进 `.app-card`，封面叠在卡片顶部（移动端 `16:9`，`sm` 起 `21:9`），正文后接文章级 footer（分类、标签、返回列表）。
- MDC 组件 `Callout` / `Spoiler` / `LinkCard` 重做配色与圆角，与卡片表面统一；`LinkCard` 仍包在 `<ClientOnly>` 中。

### 封面

- 重绘 `public/banner.svg`、`public/covers/*.svg`、`public/favicon.svg`，改用深色渐变 + 高对比标签，保证缩略图裁切后文字仍可读。
- 列表缩略图桌面用 `sm:object-left`，避免居中裁切掉封面左侧标题；文章与精选封面使用 `16:9` / `21:9` 响应式比例。

## 后果

- 视觉上更接近 HyperOS + Fuwari 的混合风格，同时保留 miuix 组件的交互细节。
- `--app-*` 与 `--m-color-*` 双层令牌意味着新增颜色要同时考虑两处；只改 Tailwind 类不会影响 miuix 组件。
- `TopBar` 不再依赖 `MiuixTopAppBar`，升级 miuix-vue 时导航部分的回归风险降低，但按钮/图标仍依赖其 SSR 行为。
- 首页与列表页的搜索/筛选是纯客户端状态，静态预渲染的 HTML 只包含全部文章，交互在 hydration 后生效。
- 极光背景与玻璃拟态对低端设备有轻微合成开销，已通过 `prefers-reduced-motion` 与静态渐变控制。

## 后续变更

2026-11-08 的 [004](004-flat-design-and-sidebar.md) 移除了本记录中的渐变与玻璃拟态：

- `--app-accent` / `--app-cyan` / `--app-pink`、`.glass`、`.text-gradient`、body 径向渐变、卡片与按钮渐变、彩色阴影全部删除。
- `TopBar` 从 `.glass` 改为 `.app-card`；`ProfileWidget` 去掉渐变横幅。
- `public/banner.svg`、`public/covers/*.svg`、`public/favicon.svg` 重绘为无渐变的扁平资产。
- 本记录的 Fuwari 信息架构、`--app-*` 令牌、CSS 加载顺序与页面结构仍然有效。
