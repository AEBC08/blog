# 当前进度与验收结果

- 日期：2026-11-08
- 状态：采纳
- 相关文件：全项目

## 已完成

### 基础设施

- 初始化 `package.json`、`pnpm-workspace.yaml`、`tsconfig.json`
- 安装依赖，批准 esbuild 构建脚本，`nuxt prepare` 成功
- `nuxt.config.ts`：baseURL、`buildAssetsDir: nuxt_assets`、Content/Mermaid/Tailwind、Nitro Vue alias/inline、prerender、MiSans 字体、CSS 顺序
- `content.config.ts`：`blog` 集合与 schema
- 内容：`hello.md`、`guide/index.md`、`markdown-showcase.md`、`interactive.md`、`draft-example.md`
- composables：`useBlogList`、`useBlogPost`、`useSidebarData`、`useTheme`
- utils：`normalize-content-path`、`resolve-cover-image`、`format-date`
- `scripts/new-post.mjs`：缺参 exit 1、`flag: 'wx'`、嵌套目录、小写文件名、ISO `published`、`draft: true`
- `eslint.config.mjs`：@antfu/eslint-config，Vue/TS，`no-explicit-any: error`
- `.github/workflows/deploy.yml`：Node 24、pnpm 12.9.1、lint/typecheck、`--preset github_pages`

### 重设计

- `main.css` 重写：明暗 `--app-*` 色板、miuix `--m-color-*` 覆盖、极光背景、`.app-card` / `.glass` / `.chip` / `.text-gradient` / 动效、精修 prose
- `TopBar` 改为自定义悬浮玻璃导航；`ThemeToggle` 仍为 `MiuixIconButton`
- `MainGrid` 增加 `hero` 插槽；页面自行拥有网格
- 首页：极光 hero、统计、精选文章、分类浏览器
- 博客列表：客户端搜索、分类 chip、结果计数
- 文章页：卡片化正文、封面叠加、文末 footer；侧边栏 Profile → TOC → Categories → Tags
- `PostCard` 精选/默认变体与响应式封面裁切；`PostMeta`、`PostList` 重做
- 侧边栏 widget 重做；`TocWidget` 使用 IntersectionObserver 滚动高亮
- MDC `Callout` / `Spoiler` / `LinkCard` 重做
- 新 `public/banner.svg`、`public/covers/*.svg`、`public/favicon.svg`
- `app/error.vue`：自定义 404/500，复用 `TopBar` / `FooterBar`，中文文案，`clearError` 返回首页

### Markdown 统一与 Fuwari 细节

- `app/components/content/ProseLi.vue`：render function 把 GFM 任务列表的 `<input type="checkbox">` 替换为 `MiuixCheckbox`（`disabled`、`prose-task-checkbox`）
- `app/components/content/ProseTable.vue`：为 Markdown 表格加 `.prose-table-wrap` 滚动/圆角容器；表格视觉由 CSS 仿制 miuix 卡片
- 引入 `@fontsource/maple-mono`（仅 400/700），`--font-mono` 为 Maple Mono + MiSans 回退；代码块开启连字
- `contentMermaid`：明 `neutral` / 暗 `dark`，Maple Mono 字体栈，中文工具栏标题与按钮文案，`flowchart` / `sequence` 关闭 `useMaxWidth`
- Mermaid 表面通过 `--ncm-*` 接入 `--app-*` 色板；宽图保留固有宽度并横向滚动
- `BackToTop` 悬浮按钮；侧边栏 `.widget-title` 渐变竖条；文章底部「较新一篇 / 较早一篇」导航卡片

### 扁平化与交互补齐

- `main.css` 色板改为中性灰底 + 单一强调色；删除 `--app-accent` / `--app-cyan` / `--app-pink`、`.glass`、`.text-gradient`、body 径向渐变、所有卡片/按钮渐变与彩色阴影
- `TopBar`、`FooterBar`、`ProfileWidget`、`LinkCard`、`PostCard`、首页 hero、文章封面、`error.vue`、`InteractivePost` 全部改为纯色表面
- `public/banner.svg`、`public/covers/*.svg`、`public/favicon.svg` 重绘为无渐变扁平资产
- `MainGrid` 的 `<aside>` 改为 `.app-sidebar`；仅在 `min-width: 1024px` 且 `min-height: 900px` 时 `sticky top-24`，短视口回到普通流
- `ProfileWidget` 改为 Fuwari 式居中卡片：无横幅、头像 64px、链接居中
- 新增 `app/components/content/ProsePre.vue`：`.prose-code` 包裹 Shiki `<pre>`，右上角 `.prose-copy` 默认隐藏，悬停/聚焦显示，触屏常显；复制成功切换对勾 1.6s
- `contentMermaid` 字体改为 MiSans，`flowchart` 使用线性连边与更宽松间距；`main.css` 用 `!important` 覆盖节点、边、子图、时序图颜色
- `MiuixSlider` 加 `.demo-slider`：`--app-bg-soft` 轨道 + `--app-primary` 填充与滑块
- 移除 `Latest` / `Explore` / `Archive` / `Article` / `Featured` / `End of article` 等英文微标签，改为中文短标签

### miuix 组件审计与主题三态

- 补齐 `--color-app-card` / `--color-app-card-hover` / `--color-app-border` / `--color-app-border-strong`，修复 `border-app-border` 回退 `currentColor` 导致的暗色亮边；暗色边框改为实色 `#2f2f2f` / `#454545`
- 补齐 miuix `--m-color-*` 映射（surface/container/disabled/slider/on-surface 变体），搜索栏、卡片、滑块、禁用态统一读取 `--app-*`
- `TopBar`、归档头、首页分类、文章容器/相邻导航、空状态、404、Profile/TOC、InteractivePost 改用 `MiuixCard`；搜索改用 `MiuixSearchBar`；404 主按钮与交互按钮改用 `MiuixButton`
- 记录 `MiuixCard` 的 `.m-card-wrapper > .m-card` 双层结构：布局/内边距放内层，popover 需要 `.topbar-card .m-card { overflow: visible }`
- `useTheme` 扩展为 `system | light | dark`，存储键 `theme-mode`，兼容旧 `theme`；`matchMedia` 实时监听；`data-theme-mode` 驱动图标
- `ThemeToggle` 改为三选项 popover（外部点击/Escape 关闭，`menuitemradio` + `aria-checked`）
- 新增 `--app-on-primary` 与 `--m-color-on-primary`，主色填充上的 `text-white` 改为 `text-app-on-primary`；暗色深色文字的初版决定后来被统一白色 on-primary 取代
- Mermaid 外框：隐藏标题、工具栏透明、去阴影/下边框、扁平软底、右侧紧凑操作；用 `.mermaid-outer-wrapper` 提升特异性压过模块 scoped 样式

### 图标系统与主题收敛

- 新增 `app/utils/icon-registry.ts`：静态导入约 175 个 Tabler 图标，登记全部 155 个 miuix 扩展图标，提供 kebab-case 名称、`miuix:` 前缀与 `help-circle` 兜底
- 新增 `app/components/Icon.vue`：统一 `size`/`strokeWidth`/`weight`/`color`/`label`，`.app-icon` 与正文基线对齐
- 组件内联 SVG/字符箭头替换为 `<Icon>`：主题切换、TopBar、Profile、PostMeta、侧栏 widget、PostCard、BackToTop、ProsePre、Callout、Spoiler、LinkCard、ProseH2、首页/列表/文章页、Footer
- `LinkCard` 的 `icon` 改为注册表名称并保留首字母兜底；`app.config.ts` 社交链接与 Footer 技术徽标使用图标名称
- `content/blog/markdown-showcase.md` 增加 `:icon{name="..."}` 语法、miuix/品牌/语义图标列表与 Mermaid 形状/子图示例
- `--app-on-primary` 在明暗主题中都改为 `#ffffff`；`--m-color-on-secondary` 固定 `#ffffff`，Switch/Slider 拇指与主色按钮文字统一白色
- Mermaid 改用 `contentMermaid.loader.init.themeCSS`：配色/字体走 `var(--app-*)`，删除 `main.css` 的节点/边/子图覆盖与 `rx/ry`，保留 Mermaid 自己生成的形状几何

### 文档

- 根 `README.md`：写作、frontmatter、Markdown 限制、部署说明
- `memory/` 记录：新增 `layout/002`、`quality/002`；`layout/001` 标记已废弃；`deployment/002` 已废弃，由 003 取代
- 新增 `markdown/003`（Markdown 组件统一与字体/Mermaid）与 `layout/003`（Fuwari 交互细节），更新索引与跨目录关联
- 新增 `layout/004`（扁平化、侧边栏、滑块）与 `markdown/004`（代码复制、Mermaid miuix 化）；`layout/002`、`layout/003`、`markdown/003` 标记为部分废弃并补充后续变更
- 新增 `ssr/004`（三态主题与 on-primary）、`layout/005`（miuix 组件审计与令牌修复）、`markdown/005`（Mermaid 外框）；`ssr/001`、`markdown/004` 标记为部分废弃；更新索引与跨目录关联
- 新增 `layout/006`（图标系统）与 `markdown/006`（Mermaid 生成主题）；`ssr/004` 的 on-primary 部分标记为部分废弃；`markdown/003`、`markdown/004`、`markdown/005` 补充后续修订；更新索引与跨目录关联

## 已验证

- `pnpm lint`：0 error / 0 warning
- `pnpm typecheck`：0 error
- 本机构建：`pnpm build` 预渲染成功，产物含 `index.html`、`blog/index.html`、`blog/hello/index.html`、`404.html`、`.nojekyll`、`nuxt_assets`
- GitHub Pages 子路径构建：`NUXT_APP_BASE_URL=/miuix-blog/ pnpm exec nuxt build --preset github_pages` 成功
- 静态预览（Node 服务器 + `gh-preview/miuix-blog/`）：
  - `/miuix-blog/`、`/miuix-blog/blog/`、`/miuix-blog/blog/hello/`、`/miuix-blog/blog/guide/`、`/miuix-blog/blog/markdown-showcase/`、`/miuix-blog/blog/interactive/` 均 200
  - `/miuix-blog/blog/draft-example/` 返回 404
  - `/miuix-blog/banner.svg`、`/miuix-blog/covers/hello.svg`、`/miuix-blog/favicon.svg` 200
  - `/miuix-blog/blog`、`/miuix-blog/blog/hello` 301 到带斜杠 URL
- SSR HTML 内容：
  - `m-card`、封面路径、自定义 `ProseH2`（`<h2 id="..." class="group">`）
  - KaTeX（`katex-display`）、Mermaid SVG、Shiki 双主题
- 视觉验证（Playwright，桌面 1440×900 / 移动 390×844，明暗两套）：
  - 首页、列表、文章、404 均正常渲染，无横向溢出
  - 列表缩略图桌面 `object-left`，封面标题可读
  - 文章封面移动端 16:9、桌面 21:9
  - 文章侧边栏 TOC 在首屏可见，滚动高亮随标题切换
  - 自定义 404 正常渲染，「回到首页」跳转 `/miuix-blog/`
- Markdown 统一验证（子路径静态预览）：
  - `markdown-showcase` 构建 HTML 含 `.m-checkbox.prose-task-checkbox`（已选/未选状态正确）
  - 表格输出 `.prose-table-wrap > table`，明暗主题均为卡片表面
  - Maple Mono 400/700 的 woff2/woff 已进入 `nuxt_assets`，代码块使用 `--font-mono`
  - Mermaid 工具栏标题为「图表」、按钮中文；暗色图表表面为 `--app-card` / `--app-bg-soft`（`#1f1f1f` / `#1b1b1b`）
  - 关闭 `useMaxWidth` 后流程图 SVG 固有宽度约 1056px，容器 `overflow-x: auto` 横向滚动，标签可读
  - 明色表格、任务列表、Mermaid 与暗色均正常；回到顶部按钮在滚动 1600px 后出现
  - 相邻文章链接：较新 `交互式文章`、较早 `写作指南`，均带 `/miuix-blog/` 前缀
- 功能验证：
  - 搜索 `Mermaid` 后列表显示「共 1 篇」
  - 主题切换 dark↔light，并写入 `localStorage`
  - Mermaid 滚动进入视口后按暗色主题渲染
- 扁平化验证（子路径静态预览，桌面 1440×1000 / 移动 390×844，明暗两套）：
  - `grep -R "gradient"` 在 `app/` 与 `public/` 下 0 命中；页面计算样式中 `background-image` 无 `gradient`
  - 首页、列表、文章、交互页、404 均无横向溢出（移动端 `scrollWidth === innerWidth === 390`）
  - 桌面侧边栏 `position: sticky`、`top: 96px`、`align-self: start`；移动端为 `static`
  - 代码块复制按钮默认 `opacity: 0`，悬停后 `opacity: 1`；点击后 `aria-label` 变为「已复制」，约 1.6s 后恢复
  - Mermaid 形状几何由 Mermaid 生成：`[]` 的 `rect` 无 `rx`、`()` 为 `rx="5"`、`([])` 为 `path`、`(())` 为 `circle`、`{}` 为 `polygon`；暗色节点 `fill: rgb(31,31,31)`、`stroke: rgb(69,69,69)`、`filter: none`；标签字体 MiSans；边线 `rgb(127,132,141)`
  - Mermaid SVG 固有宽度 1056px，容器 `overflow-x: auto`，窄屏不撑破页面
  - 滑块轨道为 `--app-bg-soft`，填充与滑块为 `--app-primary`
- `pnpm new-post`：缺参 exit 1、重复文件 exit 1、`Notes/Nuxt-Content` 生成小写嵌套路径
- miuix 组件与主题三态验证（子路径静态预览，桌面 1440×1000 / 移动 390×844）：
  - `pnpm lint` 0 error / 0 warning，`pnpm typecheck` 0 error
  - 暗色扫描全部元素边框：无亮度 > 170 且 alpha > 0.05 的描边；`MiuixCard` 边框 `rgb(47, 47, 47)`
  - 归档搜索栏 256×40、字号 14px；TopBar 桌面单行 58px，内层 `.m-card` 为 `overflow: visible`
  - 主题菜单打开后显示「系统/浅色/深色」，当前项 `aria-checked="true"`；选择后写入 `localStorage.theme-mode` 并更新 `data-theme-mode`
  - 「系统」模式下 `set-color-scheme dark|light` 无需刷新即可切换 `dark` class 与页面背景（`#121212` / `#f2f3f5`）
  - 外部点击与 Escape 均能关闭主题菜单，`aria-expanded` 同步为 `false`
  - Mermaid 块：标题 `display: none`、工具栏透明且无下边框、无阴影、圆角 16px、边框 `rgba(15,23,42,0.08)`、wrapper 内边距 `4px 12px 12px`，宽图仍横向滚动
  - 明暗主色按钮（404、交互页、首页 CTA）均为浅蓝底白字；Switch/Slider 拇指在明暗主题中均为白色
  - 首页、列表、文章、交互页、404 明暗两套均无横向溢出
- 图标与生成主题验证（子路径静态预览）：
  - `pnpm lint` 0 error / 0 warning，`pnpm typecheck` 0 error
  - 子路径构建成功；`markdown-showcase` SSR HTML 含 51 个 `.app-icon`，其中 42 个 `svg.tabler-icon`、6 个 `span.m-icon`，`:icon{...}` 仅保留在行内代码示例中
  - 明暗两套 `--m-color-on-primary` / `--m-color-on-secondary` / `--app-on-primary` 均为 `#fff`；`MiuixButton type="primary"` 文字、滑块拇指、开关拇指均为白色
  - Mermaid 暗色节点 `fill: rgb(31,31,31)`、`stroke: rgb(69,69,69)`、`filter: none`；`[]`/`()`/`([])`/`(())`/`{}` 分别输出 `rect`（无 `rx`）/`rect`（`rx="5"`）/`path`/`circle`/`polygon`
  - 主题菜单仍可切换 system/light/dark，`data-theme-mode` 与 `localStorage.theme-mode` 同步

## 遗留风险与后续

1. 本地已 `git init` 并提交 `aa47c0b`（`main`，89 个文件），但尚未配置 remote、没有推送到 GitHub；工作流未在真实 GitHub Actions 上跑过。首次推送后需确认 Pages source 设为 GitHub Actions、环境与 `baseURL` 正确。用户暂未创建仓库，部署按用户要求暂停。
2. `miuix-vue` 的 Nitro alias/inline 是版本相关修复，升级后需重新验证预渲染，详见 [ssr/003](../ssr/003-nitro-vue-duplicate.md)。
3. `pnpm peers check` 报告非致命 peer 警告（`oxc-parser >=0.140.0`、`typescript >=6.0.0`）；TypeScript 有意保持在 5.9.3。
4. `LinkCard` 按要求包在 `<ClientOnly>` 中，静态 HTML 不包含卡片内容，水合后才出现。
5. interactive 文章的 `ClientOnly` 增加了 `ContentRenderer` fallback，静态 HTML 至少包含 Markdown 正文；交互 widget 仍在水合后出现。
6. 直接访问静态 `404.html` 会在控制台输出预期的 `[NUXT_E1005]`（Nuxt 的 `app:error` 钩子），不是渲染失败，详见 [quality/002](../quality/002-custom-error-page.md)。
7. 构建产物 `.output/`、预览目录与 Playwright 临时文件属于生成物，交付前应清理；`build.log` / `build-gh.log` 已移除。
8. 静态预览服务器仅用于本机验证；本轮验证完成后已停止，浏览器标签也已关闭。正式部署依赖 GitHub Actions 产物。
9. 侧边栏固定依赖 `min-height: 900px` 断点；若继续增加侧栏 widget，需要重新评估该阈值，否则矮视口下仍会出现内容不可达。
10. Mermaid 配色依赖 `contentMermaid.loader.init.themeCSS` 的注入顺序与模块内部类名；升级 `@barzhsieh/nuxt-content-mermaid` 或 Mermaid 后需重新检查 `themeCSS` 是否生效、形状 `rx/ry` 是否仍由 Mermaid 生成。
11. 主题菜单是自定义 popover（miuix-vue 暂无 popover 原语）；若后续引入原语，需要保留 `role="menu"`、`menuitemradio`、`aria-expanded` 与外部点击/Escape 行为。
12. `MiuixCard` 的 class 只作用于 `.m-card-wrapper`；新增卡片时布局必须放内层，且 popover 需要显式放开内层 `overflow`，否则会被裁切。
13. 图标注册表是静态具名导入，图标数量继续增长会增加客户端 bundle；新增图标时同时更新 `icon-registry.ts` 的导入与 `TABLER_COMPONENTS`。正文 `:icon{...}` 前必须是行首、空白或允许的标点，中文全角标点后需补空格。
