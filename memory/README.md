# Memory 索引

本项目所有有实质影响的技术决策都记录在此。每条记录包含「背景 / 选项 / 决策 / 后果」。

## 记录索引

### architecture

- [001 Nuxt 4 目录结构与技术栈](architecture/001-nuxt4-directory-and-stack.md)：采用 Nuxt 4 默认 `app/` 源码目录，锁定实际安装版本。
- [002 当前进度与待办](architecture/002-progress-and-todos.md)：验收结果、已验证项与遗留风险，供后续会话继续。
- [003 项目定名 Mifumi 与站点身份信息](architecture/003-mifumi-identity.md)：把通用框架文案替换为 AEBC08 的个人博客身份，集中维护 `site` / `profile` / 导航与部署地址。

### layout

- [001 顶部导航与双栏主网格](layout/001-topbar-sidebar-grid.md)：**已废弃**。最初的 TopAppBar + 双栏网格方案，被 002 取代。
- [002 Fuwari 信息架构 + HyperOS 视觉重设计](layout/002-fuwari-hyperos-redesign.md)：**部分废弃**。悬浮玻璃导航、`--app-*` 令牌、极光首页、搜索/分类筛选、卡片化文章页与封面响应式比例；渐变与玻璃部分被 004 取代。
- [003 Fuwari 交互细节补齐](layout/003-fuwari-detail-polish.md)：**部分废弃**。侧边栏标题竖条、回到顶部按钮、上一篇/下一篇导航；渐变竖条与玻璃外壳被 004 改为纯色。
- [004 去除渐变与 AI 味：扁平色板、Fuwari 侧边栏与 miuix 滑块](layout/004-flat-design-and-sidebar.md)：删除全部渐变/玻璃/极光，改用中性灰底 + 单一强调色；侧边栏按视口高度启用 sticky；Profile 卡片与滑块 miuix 化；中文微标签。
- [005 miuix-vue 组件审计、暗色描边根因与缺失令牌](layout/005-miuix-component-audit-and-token-fix.md)：补齐 `--color-app-*` 映射、暗色边框改实色灰；卡片/按钮/搜索栏/开关/滑块改用 miuix-vue；记录 `MiuixCard` 的 wrapper/inner 双层约束。
- [006 统一图标系统：miuix + Tabler 注册表与 Markdown 内联图标](layout/006-icon-system.md)：新增全局 `Icon.vue` 与精选 Tabler/全部 miuix 图标注册表；正文用 `:icon{name="..."}`，并记录 `remark-mdc` 的前置字符限制。
- [007 系统主题图标改用 sun-moon，移除滑块多余阴影](layout/007-theme-icon-and-slider-audit.md)：系统模式改用 `sun-moon`；覆盖 miuix-vue 时只保留颜色令牌，删除自加的滑块拇指阴影。

### content

- [001 Content 集合、schema 与查询封装](content/001-content-schema-and-queries.md)：`blog` 集合、draft 过滤、published 降序、尾斜杠归一化。
- [002 封面图方案 B](content/002-cover-image-strategy.md)：图片放 `public/`，frontmatter 写绝对路径，统一经 `resolveCoverImage` 加 baseURL。
- [003 关于页：Markdown + Vue 混合与 pages 集合](content/003-about-page-pages-collection.md)：新增 `pages` 集合，`about.md` 负责正文，Vue 外壳与 `FriendLinks` 负责个人信息和友链区块。

### markdown

- [001 KaTeX、Shiki、Mermaid 与 MDC](markdown/001-katex-shiki-mermaid-mdc.md)：数学公式、双主题高亮、mermaid 模块、Callout/Spoiler/LinkCard。
- [002 Prose 组件覆盖路径](markdown/002-prose-override-path.md)：覆盖必须放 `app/components/content/ProseH2.vue`，与 project.md 的 `prose/` 目录建议不同。
- [003 Markdown 组件统一：Checkbox、表格、Maple Mono 与 Mermaid](markdown/003-miuix-prose-fonts-mermaid.md)：**部分废弃**。`ProseLi` 替换为 `MiuixCheckbox`、`ProseTable` 卡片滚动容器、Maple Mono + MiSans 回退、Mermaid 令牌与固有宽度；Mermaid 字体/配置被 004 更新，节点/边配色最终由 006 接管。
- [004 代码块隐藏复制按钮与 Mermaid 的 miuix 化](markdown/004-code-copy-and-mermaid-miuix.md)：**部分废弃**。`ProsePre` 包裹 Shiki `<pre>`，悬停显示复制按钮并带兜底；Mermaid 改用 MiSans、线性连边与卡片节点，CSS `!important` 覆盖模块内部样式；外框被 005 重做，节点/边覆盖被 006 取代。
- [005 Mermaid 外框重做：隐藏标题、透明工具栏与特异性修复](markdown/005-mermaid-outer-frame.md)：隐藏「图表」标题、工具栏透明、去掉阴影与下边框、扁平软底、右侧紧凑操作；用更高特异性压过模块 scoped 样式。外框仍然有效，图形配色由 006 接管。
- [006 Mermaid 改用生成主题：`themeCSS` 接管配色，保留形状几何](markdown/006-mermaid-generated-theme.md)：删除 `main.css` 的节点/边覆盖，改用 `contentMermaid.loader.init.themeCSS`；保留 Mermaid 自己生成的 `rx/ry`，让 `[]`、`()`、`([])`、`(())`、`{}` 在放大后仍可区分。

### ssr

- [001 主题初始化、FOUC 与 Mermaid 主题同步](ssr/001-theme-fouc-and-mermaid.md)：**部分废弃**。class 驱动、内联 head 脚本、CSS 切换图标、手动同步 Mermaid；存储与切换被 004 扩展为三态。
- [002 miuix-vue 类型声明路径修复](ssr/002-miuix-vue-types-path.md)：包声明路径错误，用 tsconfig paths 映射到 `dist/src`。
- [003 Nitro 预渲染时的重复 Vue 运行时](ssr/003-nitro-vue-duplicate.md)：`renderSlot` 崩溃的根因是两份 Vue，alias + inline 合并为一份。与 [deployment/001](deployment/001-baseurl-and-build-assets.md) 同属构建期问题。
- [004 三态主题、实时系统跟随与 on-primary 对比度](ssr/004-three-mode-theme-and-on-primary.md)：**部分废弃**。`theme-mode` 存 `system/light/dark`，`matchMedia` 实时响应；新增 `--app-on-primary`，但暗色深色文字的决定已被统一白色 on-primary 取代。

### deployment

- [001 baseURL、buildAssetsDir 与 `.nojekyll`](deployment/001-baseurl-and-build-assets.md)：项目站点子路径与下划线目录 404 的处理。
- [002 刷新文章页 404 与尾斜杠](deployment/002-trailing-slash.md)：**已废弃**。曾采用 `autoSubfolderIndex: false`，被 003 取代。
- [003 尾斜杠刷新：目录索引方案](deployment/003-trailing-slash-directory-index.md)：改用 `autoSubfolderIndex: true`，配合应用层路径归一化。
- [004 baseURL `/blog/` 与 `/blog` 路由冲突](deployment/004-baseurl-blog-route-collision.md)：仓库名导致的部署前缀与文章路由前缀冲突，把文章路由改为 `/posts`，集合名仍保留 `blog`。

### quality

- [001 ESLint、TypeScript 与原生 SQLite](quality/001-eslint-typescript-sqlite.md)：@antfu/eslint-config、strict 选项、node:sqlite 连接器与 pnpm 构建脚本批准。
- [002 自定义错误页与静态 404](quality/002-custom-error-page.md)：`app/error.vue` 复用站点布局与中文文案，`clearError` 返回首页，`noindex`。

## 跨目录关联

- [ssr/003](ssr/003-nitro-vue-duplicate.md) 与 [deployment/001](deployment/001-baseurl-and-build-assets.md) 都属于「构建产物只在预渲染/子路径环境下暴露」的问题，验证时必须用真实构建而不是 `pnpm dev`。
- [content/001](content/001-content-schema-and-queries.md) 的路径归一化是 [deployment/003](deployment/003-trailing-slash-directory-index.md) 的应用层兜底。
- [markdown/001](markdown/001-katex-shiki-mermaid-mdc.md) 与 [ssr/001](ssr/001-theme-fouc-and-mermaid.md) 共同决定 Mermaid 的暗色行为。
- [layout/002](layout/002-fuwari-hyperos-redesign.md) 的 CSS 加载顺序（`miuix-vue/style.css` → `main.css`）是 `--app-*` / `--m-color-*` 覆盖生效的前提。
- [quality/002](quality/002-custom-error-page.md) 复用 [layout/002](layout/002-fuwari-hyperos-redesign.md) 的卡片与令牌；静态 `404.html` 由预渲染生成，直接访问时会出现预期的 `NUXT_E1005`。
- [markdown/003](markdown/003-miuix-prose-fonts-mermaid.md) 的 Mermaid 主题与字体依赖 [layout/002](layout/002-fuwari-hyperos-redesign.md) 的 `--app-*` 令牌；Mermaid 的字体与节点样式后来由 [markdown/004](markdown/004-code-copy-and-mermaid-miuix.md) 更新；Prose 覆盖机制沿用 [markdown/002](markdown/002-prose-override-path.md)。
- [layout/003](layout/003-fuwari-detail-polish.md) 的相邻文章导航复用 [content/001](content/001-content-schema-and-queries.md) 的查询封装与路径归一化。
- [layout/004](layout/004-flat-design-and-sidebar.md) 是本轮视觉收敛的决策入口：它同时修订 [layout/002](layout/002-fuwari-hyperos-redesign.md) 的渐变/玻璃表面与 [layout/003](layout/003-fuwari-detail-polish.md) 的竖条/悬浮外壳。
- [markdown/004](markdown/004-code-copy-and-mermaid-miuix.md) 的 Mermaid 覆盖依赖 [layout/004](layout/004-flat-design-and-sidebar.md) 的 `--app-*` 扁平色板；代码复制覆盖沿用 [markdown/002](markdown/002-prose-override-path.md) 的组件覆盖机制。
- [ssr/004](ssr/004-three-mode-theme-and-on-primary.md) 依赖 [ssr/001](ssr/001-theme-fouc-and-mermaid.md) 的 head 脚本与 class 驱动机制；其 `--app-on-primary` 是 [layout/004](layout/004-flat-design-and-sidebar.md) 单一强调色板的补充令牌。
- [layout/005](layout/005-miuix-component-audit-and-token-fix.md) 修复的 `--color-app-*` 映射同时服务 [layout/004](layout/004-flat-design-and-sidebar.md) 的扁平表面与 [markdown/005](markdown/005-mermaid-outer-frame.md) 的 Mermaid 外框；`MiuixCard` 双层结构是后续所有卡片改造的前提。
- [markdown/005](markdown/005-mermaid-outer-frame.md) 是 [markdown/004](markdown/004-code-copy-and-mermaid-miuix.md) 的后续修订：外框与工具栏改由 005 决定；图形配色先沿用 004，后被 [markdown/006](markdown/006-mermaid-generated-theme.md) 迁移到 `themeCSS`；两者都依赖 [markdown/002](markdown/002-prose-override-path.md) 的覆盖路径。
- [layout/006](layout/006-icon-system.md) 的 Markdown 语法依赖 [markdown/001](markdown/001-katex-shiki-mermaid-mdc.md) 的 MDC 能力与 [markdown/002](markdown/002-prose-override-path.md) 的组件覆盖路径；图标颜色继承 [layout/004](layout/004-flat-design-and-sidebar.md) 的扁平色板。
- [markdown/006](markdown/006-mermaid-generated-theme.md) 取代 [markdown/004](markdown/004-code-copy-and-mermaid-miuix.md) 的节点/边覆盖，并与 [markdown/005](markdown/005-mermaid-outer-frame.md) 分工：006 负责图形配色，005 负责外框。
- [architecture/003](architecture/003-mifumi-identity.md) 的身份信息决定 [content/003](content/003-about-page-pages-collection.md) 的关于页内容与友链入口；仓库名 `blog` 又直接导致 [deployment/004](deployment/004-baseurl-blog-route-collision.md) 的 `/blog/` 前缀冲突。
- [content/003](content/003-about-page-pages-collection.md) 的关于页复用 [content/001](content/001-content-schema-and-queries.md) 的查询方式与 [markdown/002](markdown/002-prose-override-path.md) 的 prose 覆盖；`pages` 集合与 `blog` 集合并列，互不影响文章列表。
- [layout/007](layout/007-theme-icon-and-slider-audit.md) 修订 [layout/006](layout/006-icon-system.md) 中系统主题使用 `device-desktop` 的选择，并延续 [layout/004](layout/004-flat-design-and-sidebar.md) / [layout/005](layout/005-miuix-component-audit-and-token-fix.md) 的「只覆盖令牌、不叠加多余样式」原则。
