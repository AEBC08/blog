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

### Mifumi 身份、关于页与 `/posts` 路由

- 站点身份改为 **Mifumi** / **AEBC08**：`app.config.ts`、`nuxt.config.ts` head、`package.json`、README、`public/banner.svg`、`public/favicon.svg`、`public/covers/avatar.svg`、`content/posts/hello.md`
- 顶栏导航改为「首页 / 文章 / 关于」；首页 hero「写作指南」改为「关于我」，指向 `/about`
- 新增 `pages` 集合（`source: 'pages/**/*.md'`）与 `content/pages/about.md`；`app/pages/about.vue` 用 Vue 外壳 + `ContentRenderer` 渲染 Markdown
- 新增 `app/components/content/FriendLinks.vue`：读取 `appConfig.friends`，支持双列卡片与空状态；友链数据在 `app.config.ts` 维护
- 文章路由前缀从 `/blog` 改为 `/posts`（`app/pages/posts/*`、`content/posts/*`、`scripts/new-post.mjs`、所有站内链接与预渲染路由）；内部集合名仍为 `blog`
- 系统主题图标从 `device-desktop` 改为 `sun-moon`，并登记到 `icon-registry.ts`
- 删除 `.demo-slider .m-slider__thumb` 的自加阴影，滑块只保留颜色令牌覆盖
- `content/posts/markdown-showcase.md` 的系统主题图标示例同步改为 `sun-moon`

### 身份修正、miuix 默认主题色与 GithubRepo

- 站点标题与作者改为 **AEBC08**（`site.title` / `site.author` / `profile.name` / `nuxt.config.ts` head），Mifumi 仅作为博客框架名出现在关于页与 README；上一节「站点身份 = Mifumi」的表述已被 `architecture/004` 修正
- `TopBar` / `FooterBar` 字母 Logo 改为 `A`；`public/banner.svg` 文字改为 `AEBC08`、装饰改为 `A` 形；`public/favicon.svg` 字母改为 `A`
- 头像从 `https://github.com/AEBC08.png?size=200` 下载为 `public/covers/avatar.png`，`profile.avatar` 改为该路径，删除旧的 `avatar.svg`
- `content/pages/about.md` 改为「我是 AEBC08，这里是我的个人博客」，并说明「这个博客使用的框架叫 Mifumi」
- 主题色对齐 miuix 默认：浅色 `--app-primary: #3482ff` / `--app-primary-soft: #eaf2ff`，暗色 `--app-primary: #277af7` / `--app-primary-soft: #2b3b54`
- 新增文字强调色令牌 `--app-primary-text`：浅色 `#2569d6`、暗色 `#8ab4ff`；所有 `text-app-primary` 改为 `text-app-primary-text`，正文链接、`.chip`、列表 marker 与代码复制按钮同步改用该令牌，`--m-color-on-tertiary-container` / `--color-app-on-primary-container` 也映射到它
- 新增 `app/components/content/GithubRepo.vue`：`::GithubRepo{repo="owner/name" description="..." language="..." stars="..."}`，在 `about.md` 与 `markdown-showcase.md` 中使用
- `content/posts/hello.md` 标题改为「你好，这里是 AEBC08」，正文提一句 Mifumi 框架

### 本轮完成（2026-11-08）

上一轮交接的六项已落地：

1. 顶栏/页脚头像：`TopBar` / `FooterBar` 改用 `covers/avatar.jpg`，`resolveCoverImage` 拼 baseURL，保留首字母兜底与暗色描边，见 [layout/009](../layout/009-topbar-footer-avatar-and-footer-links.md)。
2. 页脚技术栈改为 `<a>`（Nuxt / Nuxt Content / miuix-vue / GitHub Pages），统一 `target="_blank" rel="noopener noreferrer"`，并新增「© 年份 AEBC08 + CC BY-NC-SA 4.0」一行。
3. 全站声明 **CC BY-NC-SA 4.0**：页脚、关于页、README、`package.json` 的 `license`，见 [content/007](../content/007-site-license-cc-by-nc-sa.md)。
4. `GithubRepo` 的语言 / Star / Fork / 许可证改为构建期读 GitHub API 并逐项开关，`show-avatar` 可选，见 [content/008](../content/008-github-repo-api-fetch.md)。原先手填字段的 [content/005](../content/005-github-repo-card-fields.md) 已废弃。
5. `LinkCard` 新增 `icon-bg` / `icon-color`，默认无背景色，见 [content/006](../content/006-linkcard-icon-background.md)。
6. 标签页图标改为头像，头像文件由 `avatar.png` 改名为 `avatar.jpg`，见 [architecture/005](../architecture/005-favicon-and-avatar-file.md)。
7. 友链改用 `about.md` 里的 `::LinkCard`，删除 `FriendLinks.vue` 与 `app.config.friends`，见 [content/009](../content/009-friends-via-linkcard.md)。

仍未开工的可选项：顶栏「自定义选项弹窗」（不只是调色），扩展现有 `useTheme`，见 [layout/008](../layout/008-miuix-default-primary.md) 后果部分。

本轮验证方式与结果（2026-11-08）：

- `pnpm lint`、`pnpm typecheck` 均 0 error
- `NUXT_APP_BASE_URL=/blog/ pnpm exec nuxt build --preset github_pages` 通过（Git Bash 需加 `MSYS_NO_PATHCONV=1`，见 [deployment/005](../deployment/005-git-bash-base-url.md)）
- 用无头 Edge + ADB 协议在 `127.0.0.1` 静态服务上验证 `/blog/`、`/blog/about/`、`/blog/posts/`、`/blog/posts/markdown-showcase/`：
  - 顶栏/页脚确实是 `<img src="/blog/covers/avatar.jpg">`，`naturalWidth=200`，页面上不再有字母 `A` 方块
  - `<link rel="icon" type="image/jpeg" href="/blog/covers/avatar.jpg">` 与 `apple-touch-icon` 同时存在
  - 页脚 5 条链接都是 `<a target="_blank" rel="noopener noreferrer">`，协议文案可见
  - `LinkCard` 不传 `icon-bg` 时计算样式 `background-color: rgba(0, 0, 0, 0)`；传 `var(--app-primary)` / 十六进制时等于所传颜色
  - 390px 宽下 `documentElement.scrollWidth === 390`，页脚不横向溢出；明暗两套无 console error
- `GithubRepo` 的 API 数据在本机沙箱里取不到（证书拦截），走的是回落分支：卡片只渲染仓库名与描述，不报错、不漏空标签。CI 有网络且有 `GITHUB_TOKEN`，届时会带上真实数字。

### 文档

- 根 `README.md`：写作、frontmatter、Markdown 限制、部署说明
- `memory/` 记录：新增 `layout/002`、`quality/002`；`layout/001` 标记已废弃；`deployment/002` 已废弃，由 003 取代
- 新增 `markdown/003`（Markdown 组件统一与字体/Mermaid）与 `layout/003`（Fuwari 交互细节），更新索引与跨目录关联
- 新增 `layout/004`（扁平化、侧边栏、滑块）与 `markdown/004`（代码复制、Mermaid miuix 化）；`layout/002`、`layout/003`、`markdown/003` 标记为部分废弃并补充后续变更
- 新增 `ssr/004`（三态主题与 on-primary）、`layout/005`（miuix 组件审计与令牌修复）、`markdown/005`（Mermaid 外框）；`ssr/001`、`markdown/004` 标记为部分废弃；更新索引与跨目录关联
- 新增 `layout/006`（图标系统）与 `markdown/006`（Mermaid 生成主题）；`ssr/004` 的 on-primary 部分标记为部分废弃；`markdown/003`、`markdown/004`、`markdown/005` 补充后续修订；更新索引与跨目录关联
- 新增 `architecture/003`（Mifumi 身份）、`content/003`（关于页与 `pages` 集合）、`deployment/004`（`/blog/` 前缀冲突与 `/posts` 路由）、`layout/007`（`sun-moon` 与滑块阴影）；更新索引与跨目录关联
- 新增 `architecture/004`（站点身份修正为 AEBC08）、`layout/008`（miuix 默认主题色）、`content/004`（`GithubRepo` MDC 组件）；`architecture/003` 标记为部分废弃；更新索引与跨目录关联
- 新增 `layout/009`（顶栏/页脚头像与页脚超链接）、`content/005`（`GithubRepo` 字段扩展）、`content/006`（`LinkCard` 图标背景）、`content/007`（CC BY-NC-SA 4.0 声明），四条均为**待实现**交接记录；`architecture/002` 增加「待实现」章节与验收清单；更新索引与跨目录关联

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
- Mifumi 身份、关于页与 `/posts` 验证（`NUXT_APP_BASE_URL=/blog/` 子路径构建 + Node 静态服务器）：
  - `pnpm lint` 0 error / 0 warning，`pnpm typecheck` 0 error
  - 构建产物含 `index.html`、`about/index.html`、`posts/index.html`、`posts/hello/index.html`、`posts/guide/index.html`、`posts/markdown-showcase/index.html`、`posts/interactive/index.html`
  - `/blog/`、`/blog/about`、`/blog/posts`、`/blog/posts/hello` 均 200；页面无 console error，网络请求无 4xx/5xx
  - 首页、文章列表、文章详情与页脚的站内链接均为 `/blog/posts/...` 或 `/blog/about`，无 `/blog/blog` 重复前缀
  - 关于页正确渲染 Markdown 正文、`About` 微标签、友链空状态与「交换友链」GitHub 链接
  - 系统模式下主题触发按钮与菜单项显示 `sun-moon`（`display: block`），浅色/深色模式分别显示 `sun` / `moon`
  - 交互页滑块 `.m-slider__thumb` 计算样式 `box-shadow: none`
  - 首页、文章列表、文章详情、关于页在明暗两套主题下均正常渲染，无横向溢出
- AEBC08 身份、miuix 默认主题色与 GithubRepo 验证（`NUXT_APP_BASE_URL=/blog/` 子路径构建 + Node 静态服务器）：
  - `pnpm lint` 0 error / 0 warning，`pnpm typecheck` 0 error
  - 浏览器标题为「首页 · AEBC08」「关于 · AEBC08」，顶栏与页脚 Logo 为 `A`
  - 首页 hero 使用 GitHub 下载的 `avatar.png`，显示 `AEBC08.` 与 `A` 形横幅装饰
  - 关于页显示 `About` 微标签、AEBC08 个人信息、Mifumi 框架说明、`AEBC08/blog` 仓库卡片与友链空状态
  - `markdown-showcase` 的 `GitHub 仓库卡片` 章节正确渲染 `nuxt/content` 卡片
  - 明色 `--app-primary: #3482ff`、`--app-primary-soft: #eaf2ff`、`--app-primary-text: #2569d6`；暗色 `--app-primary: #277af7`、`--app-primary-soft: #2b3b54`、`--app-primary-text: #8ab4ff`
  - 暗色激活导航与 `.chip` 的计算色为 `rgb(138, 180, 255)` 文字配 `rgb(43, 59, 84)` 背景（5.42:1）；浅色为 `rgb(37, 105, 214)` 配 `rgb(234, 242, 255)`（4.58:1）
  - `/blog/`、`/blog/about`、`/blog/posts/markdown-showcase` 均 200，无 console error，网络请求无 4xx/5xx
  - 关于页与仓库卡片的头像、图标、语言圆点、外链箭头均正常渲染

## 遗留风险与后续

1. 本地已 `git init`，最新提交为 `df1aa3c`（`main`，`feat: rebrand to AEBC08 and add GitHub repo card`），但尚未配置 remote、没有推送到 GitHub；工作流未在真实 GitHub Actions 上跑过。首次推送后需确认 Pages source 设为 GitHub Actions、环境与 `baseURL` 正确。用户暂未创建 `AEBC08/blog` 仓库，部署按用户要求暂停。本轮交接的 6 项需求（头像、页脚链接、许可协议、GithubRepo 字段、LinkCard 背景、自定义弹窗）**代码尚未实现**，详见「待实现」章节。
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
14. 内部 Content 集合名仍为 `blog`，公开路由却是 `/posts`；新增代码时不要按集合名推断 URL，路径以 `post.path` 与 `content/posts/` 为准，详见 [deployment/004](../deployment/004-baseurl-blog-route-collision.md)。
15. 关于页的 `content/pages/about.md` 在 Content 中路径是 `/pages/about`，公开路由是 `/about`；新增独立页面需要同时创建 `content/pages/<name>.md` 与 `app/pages/<name>.vue`，详见 [content/003](../content/003-about-page-pages-collection.md)。
16. 友链当前为空数组，页面显示空状态；添加友链需要在 `appConfig.friends` 中填写 `{ name, href, description, icon? }`，图标名必须是注册表已有名称。
17. 覆盖 miuix-vue 组件时优先只改 CSS 变量；`sun-moon` 与滑块阴影的教训见 [layout/007](../layout/007-theme-icon-and-slider-audit.md)，不要再给上游组件追加非必要阴影或尺寸。
18. 头像是从 GitHub 下载的本地副本（`public/covers/avatar.png`），不会自动跟随 GitHub 更新；更换头像后需要重新下载覆盖，详见 [architecture/004](../architecture/004-site-identity-aebc08.md)。
19. 强调色已拆成填充色 `--app-primary` 与文字色 `--app-primary-text`：文字、图标、链接用后者，按钮/圆点/边框等填充仍用前者。新增强调色文字时不要直接用 `text-app-primary`，否则浅色 `#3482ff` 在 `#eaf2ff` 上只有 3.22:1、暗色 `#277af7` 在 `#2b3b54` 上只有 2.81:1，详见 [layout/008](../layout/008-miuix-default-primary.md)。
20. `GithubRepo` 的 Star 数、语言、Fork 数与许可证都是静态 props，不会自动从 GitHub API 更新；需要准确数据时手动修改，或在构建期抓取并保留 props 作为覆盖值，详见 [content/004](../content/004-github-repo-mdc-card.md) 与 [content/005](../content/005-github-repo-card-fields.md)。
21. 顶栏暂未实现「自定义选项弹窗」；当前仍是 `ThemeToggle` 三态菜单 + miuix 默认主题色。若要做运行时调色，应扩展现有 `useTheme`，避免出现两套主题状态。
22. `LinkCard` 的图标背景一旦改为可配置（[content/006](../content/006-linkcard-icon-background.md)），默认值必须保持透明；已有 Markdown 若想保留主色方块，需要显式写 `icon-bg`，不要改组件默认值来迁就旧内容。
23. 顶栏/页脚的头像依赖 `public/covers/avatar.png`，属于本地副本；`TopBar` / `FooterBar` 改造时务必用 `resolveCoverImage()` 拼 `baseURL`，否则子路径部署下会 404（见 [layout/009](../layout/009-topbar-footer-avatar-and-footer-links.md)）。
