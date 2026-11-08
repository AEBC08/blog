\## 交接状态（2026-11-08，优先阅读）



\> 本节记录代码的真实状态与待办，\*\*与下方原始规范冲突时以本节为准\*\*。逐条决策与踩坑记录见 `memory/README.md`。



\*\*当前状态\*\*：`main` 已连远程 `origin`（`https://github.com/AEBC08/blog`），Pages 走 GitHub Actions 发布，站点 <https://aebc08.github.io/blog/>。具体部署步骤与坑见 `memory/deployment/006`。



\*\*已落地、与下方旧规范不同的地方\*\*：



\- 内容目录是 `content/posts/`，不是 `content/blog/`；公开路由是 `/posts/...`，不是 `/blog/...`。部署前缀本身已是 `/blog/`，改路由是为了避免 `/blog/blog`，详见 `memory/deployment/004`

\- 源码在 Nuxt 4 的 `app/` 下：`app/components/`、`app/pages/`、`app/composables/`、`app/utils/`，不存在顶层 `components/` / `pages/`

\- 站点标题、作者、`profile.name` 都是 \*\*AEBC08\*\*；Mifumi 仅作为博客框架名出现在关于页与 README

\- 关于页走 `pages` 集合：`content/pages/about.md` 提供正文，`app/pages/about.vue` 提供外壳；公开路由 `/about`，Content 路径 `/pages/about`

\- 主题色是 miuix-vue 默认值，且拆成了填充色与文字色两个令牌：`--app-primary`（浅 `#3482ff` / 暗 `#277af7`）用于按钮、圆点、边框；`--app-primary-text`（浅 `#2569d6` / 暗 `#8ab4ff`）用于文字、图标、链接。新增强调色文字不要用 `text-app-primary`

\- MDC 组件在 `app/components/content/`：`Callout`、`Spoiler`、`LinkCard`（`ClientOnly`）、`GithubRepo`、`FriendLinks`、`InteractivePost`、`ProseH2`、`ProsePre`、`ProseTable`、`ProseLi`

\- 静态资产：头像 `public/covers/avatar.jpg`（GitHub 下载的本地副本，同时作为浏览器标签页图标）、横幅 `public/banner.svg`；旧的 `public/favicon.svg` 已删除

\- 构建验证命令：`$env:NUXT\_APP\_BASE\_URL='/blog/'; pnpm exec nuxt build --preset github\_pages`，产物在 `.output/public`（已 gitignore）



\## 本轮已完成（2026-11-08，最新）



上一轮列出的六项需求全部落地，并新增三项：标签页图标换成头像、友链改用 MDC `LinkCard`、远程仓库与 Pages 上线。逐条决策见 `memory/README.md`，状态汇总见 `memory/architecture/002-progress-and-todos.md`。



\- 顶栏/页脚头像、页脚技术栈超链接与 CC BY-NC-SA 4.0 协议行：`memory/layout/009`、`memory/content/007`

\- `GithubRepo` 的语言 / Star / Fork / 许可证改为**构建期读 GitHub API** 并逐项开关（`show-language` / `show-stars` / `show-forks` / `show-license` / `show-avatar`），请求失败回落静态 props：`memory/content/008`（旧的手填方案 `content/005` 已废弃）

\- `LinkCard` 新增 `icon-bg` / `icon-color`，默认透明：`memory/content/006`

\- 标签页图标 = 头像，`avatar.png` 改名为 `avatar.jpg`：`memory/architecture/005`

\- 友链改为 `content/pages/about.md` 里的 `::LinkCard`，删除 `FriendLinks.vue` 与 `app.config.friends`：`memory/content/009`

\- 远程仓库 `AEBC08/blog` 与 Pages（`build_type=workflow`）：`memory/deployment/006`



\*\*仍未开工\*\*：顶栏「自定义选项弹窗」（不只是调色），扩展现有 `useTheme`，见 `memory/layout/008` 后果部分。





\## 项目目标



用 \*\*Nuxt 4 + Nuxt Content v3\*\* 搭建一个博客，最终\*\*静态部署到 GitHub Pages\*\*。信息架构参考 \[saicaca/fuwari](https://github.com/saicaca/fuwari)，UI 组件使用 \[YuKongA/miuix-vue](https://github.com/YuKongA/miuix-vue)，样式用 \*\*Tailwind CSS\*\*。



核心工作流：\*\*在 `content/blog/` 下添加一个 `.md` 文件，就自动成为一篇可访问的博文\*\*，发帖体验与 Fuwari 的 `pnpm new-post <filename>` 对齐。同时支持“高级博文”——本质是 Vue 组件驱动的页面，但仍以 `.md` 文件为入口。



\*\*Fuwari 是 Astro + Svelte 项目，不要复制或转换它的 `.astro` / `.svelte` 文件。\*\* 借鉴它的信息架构与响应式思想，但\*\*布局形态需要与 miuix-vue 组件体系融合，不要求一比一复刻\*\*。



\*\*Memory 是强制交付物。\*\* Agent 必须在 `memory/` 下按分类记录每一次技术决策，规范见下方独立章节。\*\*代码规范同样是强制交付物\*\*，交付前必须通过 `lint` 与 `typecheck`。





\## 技术栈



```

Nuxt 4 (^4.1.0)

@nuxt/content v3 (>=3.5.0 <4.0.0)

miuix-vue + motion-v (^2, peer 依赖，vue ^3.4)

Tailwind CSS

@barzhsieh/nuxt-content-mermaid

remark-math + rehype-katex + katex

nuxt-github-pages（可选，见部署章节）

TypeScript（strict 模式）

ESLint + Prettier（或 @antfu/eslint-config）

```



miuix-vue 在 app 入口导入 `miuix-vue/style.css`。图标从 `miuix-vue/icons` 单独导入以支持 tree-shaking。





\## Memory 决策记录（强制）



Agent 必须在项目根目录维护 `memory/` 目录，\*\*每一次有实质影响的技术决策都要记录\*\*，且\*\*按类别分目录存储，禁止全部堆在一个文件夹\*\*。



\### 目录结构



```

memory/

&#x20; README.md                    # 索引：列出所有条目及其一句话摘要

&#x20; architecture/                # 架构与目录结构决策

&#x20; layout/                      # 布局与 miuix-vue 融合方案

&#x20; content/                     # Nuxt Content schema、查询、slug 策略

&#x20; markdown/                    # Markdown 扩展语法（KaTeX、Shiki、Mermaid、MDC）

&#x20; ssr/                         # SSR / hydration 相关决策

&#x20; deployment/                  # GitHub Pages 部署配置与踩坑

&#x20; quality/                     # 代码规范、lint、typecheck 相关决策

```



如果某条决策同时涉及多个类别，\*\*放在其最主要归属的目录\*\*，并在 `README.md` 索引中交叉引用。



\### 每条记录的格式



文件名使用 `NNN-短描述.md`（如 `001-base-url-and-preset.md`），内容至少包含：



```md

\# 决策标题



\- 日期：YYYY-MM-DD

\- 状态：采纳 / 待验证 / 已废弃

\- 相关文件：列出受影响的关键文件路径



\## 背景

为什么需要做这个决策。



\## 选项

考虑过哪些方案，各自利弊。



\## 决策

最终选择了什么，为什么。



\## 后果

这个决策带来的影响、遗留风险、后续需要关注的点。

```



\### 执行时机



\- \*\*每完成一个模块或解决一个非显而易见的问题后，立即写入 memory\*\*，不要等到最后补记

\- 遇到 SSR 报错、 hydration mismatch 、部署 404 等\*\*踩坑类问题\*\*，修复后必须记录到对应目录（`ssr/` 或 `deployment/`），写清楚“症状 → 根因 → 修复方式”

\- 实现过程中如果\*\*推翻了之前某条决策\*\*，不要删除旧记录，在旧记录中把状态改为 `已废弃` 并注明被哪条新决策取代

\- `memory/README.md` 必须保持最新，每新增一条记录就更新索引





\## 代码规范（强制，交付前必须全部满足）



\### 工具链



\- `tsconfig.json` 开启 `strict: true`、`noUncheckedIndexedAccess: true`、`noImplicitOverride: true`

\- 使用 \*\*ESLint + Prettier\*\*，或 `@antfu/eslint-config`（推荐）。必须配置 Vue 与 TypeScript 规则

\- `package.json` 提供 `"lint"`、`"lint:fix"`、`"typecheck"` 脚本

\- \*\*`pnpm lint` 与 `pnpm typecheck` 零错误\*\*



\### TypeScript



\- \*\*禁止 `any`\*\*。无法确定类型时用 `unknown` 配合类型守卫或收窄

\- 所有组件 props 用 `interface` 定义，配合 `withDefaults(defineProps<Props>(), {...})`

\- 所有 emit 用 `defineEmits<{ event: \[payload: T] }>()` 显式标注

\- API 返回值、composable 返回值必须有显式返回类型

\- Nuxt Content 查询结果类型从 `@nuxt/content` 导入，\*\*`content.config.ts` 的 schema 是类型的唯一来源\*\*



\### 命名



\- \*\*组件\*\*：`PascalCase.vue`

\- \*\*composable\*\*：`useXxx.ts`，导出 `useXxx`

\- \*\*工具函数文件\*\*：`kebab-case.ts`，函数名 `camelCase`

\- \*\*常量\*\*：`SCREAMING\_SNAKE\_CASE`

\- \*\*目录\*\*：`kebab-case`

\- \*\*CSS\*\*：Tailwind 原子类；除 miuix-vue 预设类或明确的全局样式外，\*\*禁止新增自定义类名\*\*



\### 文件组织



```

app.vue

nuxt.config.ts

content.config.ts

components/

&#x20; layout/

&#x20; sidebar/

&#x20; post/

&#x20; content/          # MDC 组件

&#x20; prose/            # 覆盖的 Prose 组件

composables/

utils/

pages/blog/

&#x20; index.vue

&#x20; \[...slug].vue

content/blog/

scripts/new-post.mjs

memory/             # 决策记录

.github/workflows/deploy.yml

```



\### Vue 组件规范



\- \*\*一律 `<script setup lang="ts">`\*\*，不写 Options API

\- 顺序：`script setup` → `template` → `style`（尽量不写 style）

\- \*\*禁止在 setup 顶层访问 `window` / `document` / `localStorage`\*\*

\- 组件约 200 行以内，超出则拆分；展示组件只接收 props，数据获取在页面或 composable 中

\- 无残留 `console.log`（脚本中的用户输出除外），无注释掉的死代码



\### 注释



\- 复杂逻辑注释\*\*原因\*\*，不注释“做了什么”

\- 公共函数、composable 必须有 JSDoc 简述

\- 魔法数字、SSR 特殊处理、绕过已知问题的写法必须加注释



\### 质量



\- 无未使用 import / 变量

\- 无 ESLint disable 注释（确需禁用时说明理由）

\- 所有 async 操作有错误处理

\- 所有 `useAsyncData` / `useFetch` 提供稳定 key





\## 布局（Fuwari 信息架构 + miuix-vue 融合）



\*\*不要求一比一复刻 Fuwari 网格尺寸\*\*。保留“顶部导航 + 侧边栏模块 + 主内容”的信息架构，视觉与组件用 miuix-vue 表达，列宽与断点按 miuix 视觉密度调整。



\### 顶部导航



`MiuixTopAppBar` 承担导航。SSR 有风险则 `<ClientOnly>` 或 Tailwind 自建等效栏。移动端可选 `MiuixNavigationBar` 或抽屉菜单。



\### 主网格



`MainGrid.vue` 用 Tailwind Grid：



\- \*\*桌面端\*\*：侧边栏 + 主内容两栏。侧边栏 `16rem`–`20rem`，\*\*不锁定 `17.5rem`\*\*；主内容 `minmax(0, 1fr)`

\- \*\*移动端\*\*：单列，侧边栏下移到内容之后

\- 粘性区域 `position: sticky`，父级 `align-items: start`

\- 宽屏可选浮动 TOC 列，或保持两栏



\### 侧边栏 widget



外框可用 `MiuixCard` 或纯 Tailwind 卡片。\*\*ProfileWidget\*\* 数据来自 `app.config.ts`；\*\*CategoriesWidget\*\* / \*\*TagsWidget\*\* 数据从 Nuxt Content 聚合；\*\*TocWidget\*\* 仅文章页。数据获取封装在 `composables/useSidebarData.ts`。





\## Nuxt Content 配置



`content/blog/hello.md` → `/blog/hello`，`content/blog/guide/index.md` → `/blog/guide`。



`content.config.ts` 定义 `blog` 集合，`type: 'page'`，`source: 'blog/\*\*/\*.md'`，schema：



```ts

published: z.date(),

description: z.string().optional(),

tags: z.array(z.string()).default(\[]),

category: z.string().optional(),

draft: z.boolean().default(false),

image: z.string().optional(),

lang: z.string().optional(),

layout: z.enum(\['default', 'interactive']).default('default'),

```



自定义字段必须显式声明。查询封装：`useBlogList()` 过滤 `draft`、按 `published` 降序、只 `select` 列表字段；`useBlogPost()` 按路径查单篇，`null` 或 `draft` 时 `throw createError({ statusCode: 404 })`。





\## 发帖脚本



`scripts/new-post.mjs`，`package.json` 加 `"new-post": "node scripts/new-post.mjs"`。参数缺失时 `exit(1)`；`writeFile` 用 `flag: 'wx'` \*\*不覆盖\*\*；自动 `mkdir` 支持嵌套 slug；文件名\*\*统一小写\*\*；frontmatter 与 schema 严格对应，`published` 为 ISO 时间，`draft` 默认 `true`，`layout` 默认 `default`。脚本本身遵循代码规范。





\## MDC 高级博文



`components/content/` 下组件自动对 MDC 可用。实现 \*\*`InteractivePost.vue`\*\* 示例。文章页根据 `layout` 分支：



```vue

<ClientOnly v-if="page?.layout === 'interactive'">

&#x20; <InteractivePost :page="page" />

</ClientOnly>

<ContentRenderer v-else :value="page" />

```



\*\*覆盖至少一个 Prose 组件\*\*（如 `ProseH2.vue`），props 类型与原组件一致，从 `@nuxt/content` 导入。





\## Markdown 扩展语法



\### 数学公式（KaTeX）



安装 `remark-math`、`rehype-katex`、`katex`。`nuxt.config.ts` 引入 `katex/dist/katex.min.css`，配置 `remarkPlugins: \['remark-math']` 与 `rehypePlugins: { 'rehype-katex': { output: 'html' } }`。



\*\*` ```math ` 围栏在 Nuxt Content v3 中会被当作 `ProseCode` 渲染\*\*，`remark-math` 不生效。\*\*统一使用 `$...$` 和 `$$...$$`\*\*，并在 README 中注明此限制。



\### 代码高亮（Shiki）



`content.build.markdown.highlight` 配置亮/暗主题（`github-light` / `github-dark`），`langs` 只列实际用到的语言。



\### GFM



表格、任务列表、删除线为内置支持，验证即可。



\### MDC 组件



`Callout.vue`（`type` prop）、`Spoiler.vue`（`<details>` 或 CSS）、`LinkCard.vue`（\*\*必须 `<ClientOnly>`\*\*，避免 SSR 外部请求）。



\### Mermaid



使用 `@barzhsieh/nuxt-content-mermaid`。模块自动将 ` ```mermaid ` 转为响应式图表，内置懒加载与主题切换，\*\*不需要手动 `<ClientOnly>`\*\*。安装后在 `modules` 注册即可。





\## miuix-vue SSR 策略



\*\*分层：\*\*



| 类别 | 示例 | 策略 |

|---|---|---|

| 静态基础 | `Button`、`Card`、`Text`、`Divider`、`Icon` | 直接用 |

| 容器 / 导航 | `TopAppBar`、`NavigationBar`、`TabRow`、`ScrollArea` | 先测 SSR；报错则 `<ClientOnly>` 或降级 |

| 交互动画 | `Dialog`、`BottomSheet`、`Switch`、`Slider` | \*\*必须\*\* `<ClientOnly>` 或仅在 `onMounted` 后渲染 |



主题在 Nuxt 插件中统一初始化，避免 FOUC 与 hydration mismatch。\*\*某个组件 SSR 问题严重且无法局部解决时，替换为纯 CSS / 原生元素\*\*。每个引入的组件都需在 `build + preview` 下验证水合。





\## 封面图路径



\*\*选一个方案执行到底：\*\* 方案 A（推荐）`nuxt-content-assets` 保留相对路径；方案 B 图片放 `public/`、frontmatter 写绝对路径。路径解析封装为 `utils/resolveCoverImage.ts`，列表与文章页共用。





\## GitHub Pages 部署适配（关键，必须正确配置）



博客将部署为 GitHub Pages \*\*项目站点\*\*（`https://<user>.github.io/<repository>/`，无自定义域名）。以下配置必须一次性做对，否则会出现资源 404 或刷新 404。



\### baseURL 与构建预设



项目站点必须让构建产物知道自己的子路径前缀。在 GitHub Actions 中通过环境变量传入\*\*仓库名\*\*：



```

NUXT\_APP\_BASE\_URL: /${{ github.event.repository.name }}/

```



并使用 Nuxt 官方的 \*\*`github\_pages` 预设\*\*构建：



```

npx nuxt build --preset github\_pages

```



如果将来配置了自定义域名，需要删除 `NUXT\_APP\_BASE\_URL` 环境变量（或设为 `/`）。



\### `\_nuxt` 目录 404：下划线前缀问题



GitHub Pages 默认忽略以下划线开头的文件和目录，而 Nuxt 默认把 JS/CSS 资源输出到 `\_nuxt/` 下，直接部署会导致\*\*所有脚本和样式 404\*\*。两种解决方式，\*\*选其一\*\*：



\- \*\*推荐\*\*：在 `nuxt.config.ts` 中修改资源目录名，彻底避开下划线：

&#x20; ```ts

&#x20; app: {

&#x20;   buildAssetsDir: 'nuxt\_assets',

&#x20; },

&#x20; ```

\- \*\*或\*\*：在构建输出目录（`.output/public/`）中放置一个空的 `.nojekyll` 文件，绕过 GitHub Pages 的 Jekyll 处理



如果选择 `buildAssetsDir` 方案，需验证 Tailwind、miuix-vue 的 CSS 和图片路径都随之前缀正确解析。



\### Nuxt Content 刷新 404（trailing slash 问题）



静态生成后，Nuxt 默认把 `/blog/hello` 生成为 `/blog/hello/index.html`，浏览器刷新时 URL 会自动加尾斜杠变为 `/blog/hello/`，而 Nuxt Content 数据库中的 path 是不带尾斜杠的 `/blog/hello`，精确匹配失败 → \*\*刷新文章页出现 404\*\*。



\*\*解法（选其一）：\*\*



\- \*\*推荐\*\*：安装 `nuxt-github-pages` 模块，在 `modules` 中注册即可。它在构建时自动为每个 `/path/index.html` 生成一份 `/path.html` 副本，使带不带尾斜杠都能正确解析。

\- \*\*备选\*\*：在 `nuxt.config.ts` 中关闭子目录索引生成：

&#x20; ```ts

&#x20; nitro: {

&#x20;   prerender: {

&#x20;     autoSubfolderIndex: false,

&#x20;   },

&#x20; },

&#x20; ```

&#x20; 但这会影响所有路由的产物结构，需额外验证。



在 `useBlogPost()` 的路径查询中，\*\*对 `route.path` 做一次尾斜杠归一化\*\*（去掉末尾的 `/`），作为额外的防御层。



\### GitHub Actions 工作流



创建 `.github/workflows/deploy.yml`，使用官方推荐的 `actions/upload-pages-artifact` + `actions/deploy-pages` 组合，或 `peaceiris/actions-gh-pages`。构建步骤中传入 `NUXT\_APP\_BASE\_URL`，构建产物目录为 `./.output/public`。工作流需配置 `pages: write` 和 `id-token: write` 权限。



\### 本地验证部署产物



在推送前，\*\*本地必须用 `npx nuxt build --preset github\_pages` 配合 `NUXT\_APP\_BASE\_URL=/<repo>/` 构建一次，然后用 `npx serve .output/public` 或在子路径下预览\*\*，确认：



\- 页面能加载，JS/CSS 无 404

\- 刷新文章页（带尾斜杠）不 404

\- 图片和封面路径正确带上了仓库前缀



\*\*不要只依赖 `pnpm dev` 验证。\*\* 静态托管的路径行为与开发服务器不同，部署问题只有在模拟子路径的静态环境下才能暴露。





\## 验收标准（逐项确认）



\*\*Memory：\*\*



1\. `memory/` 目录存在，且\*\*至少包含 `architecture/`、`content/`、`ssr/`、`deployment/` 四个子目录\*\*

2\. `memory/README.md` 是完整的索引，每条记录有一句话摘要

3\. 每解决一个 SSR / 部署 / MDC 相关非平凡问题后，都有对应的 `.md` 记录（检查“症状 → 根因 → 修复”是否完整）

4\. 被推翻的决策\*\*保留在目录中\*\*，状态改为“已废弃”



\*\*功能：\*\*



5\. 新建 `.md` 文件刷新即出现在列表（`draft: true` 不出现）

6\. `hello.md` → `/blog/hello`，`guide/index.md` → `/blog/guide`

7\. `pnpm new-post test-post` 生成完整 frontmatter，`draft` 为 `true`

8\. 桌面端两栏、移动端单列，布局与 miuix-vue 视觉协调

9\. 暗色模式切换正常，无 FOUC

10\. 封面路径统一解析

11\. `$...$` / `$$...$$` 渲染 KaTeX，代码块主题高亮

12\. ` ```mermaid ` 渲染 SVG，暗色主题切换正常

13\. `layout: interactive` 走 `InteractivePost`，其余走 `ContentRenderer`

14\. 至少一个自定义 Prose 组件覆盖生效

15\. `Callout`、`Spoiler` 通过 `::` 调用正常；`LinkCard` 已 `<ClientOnly>`



\*\*工程与部署：\*\*



16\. \*\*`pnpm lint` 零错误零警告\*\*

17\. \*\*`pnpm typecheck` 零错误\*\*

18\. `pnpm build` + `pnpm preview` 无 SSR 错误、无 hydration mismatch

19\. 所有 miuix-vue 交互动画组件要么 SSR 正常，要么已 `<ClientOnly>` 包裹

20\. 全项目无 `any`、无未使用变量、无残留 `console.log`、无死代码

21\. \*\*`NUXT\_APP\_BASE\_URL` 与 `github\_pages` 预设已配置\*\*，且\*\*本地模拟子路径构建验证通过\*\*

22\. \*\*`\_nuxt` 404 已按方案解决\*\*（`buildAssetsDir` 或 `.nojekyll`），资源加载正常

23\. \*\*刷新文章页不 404\*\*（尾斜杠问题已处理，`nuxt-github-pages` 或 `autoSubfolderIndex`）

24\. `.github/workflows/deploy.yml` 存在且触发分支、权限、产物路径正确

25\. \*\*`memory/deployment/` 中有对应的部署踩坑记录\*\*（`\_nuxt` 和 trailing slash 各至少一条）





\*\*实现顺序建议\*\*：先搭建 Nuxt + Content + 发帖脚本 + 基础页面，确认“加 md 即博文”跑通；接入 Tailwind 布局与 miuix-vue（逐个验证 SSR）；叠加 MDC 高级博文、KaTeX、Mermaid、Prose 覆盖；\*\*在本地完成 GitHub Pages 子路径模拟构建\*\*，解决 `\_nuxt` 和 trailing slash 问题；最后配置 Actions 工作流，跑 `lint` + `typecheck` + `build` + `preview` 四项检查。\*\*每一步都执行完整检查，不要等到最后才发现问题。\*\*

