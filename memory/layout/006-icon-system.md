# 统一图标系统：miuix + Tabler 注册表与 Markdown 内联图标

- 日期：2026-11-08
- 状态：采纳
- 相关文件：`app/components/Icon.vue`、`app/utils/icon-registry.ts`、`app/assets/css/main.css`、`app/app.config.ts`、`content/blog/markdown-showcase.md`、`app/components/content/LinkCard.vue`、`app/components/layout/FooterBar.vue`、`app/components/layout/ThemeToggle.vue`

## 背景

界面里的图标原本是零散的内联 `<svg>`：尺寸、线宽、圆角端点各不相同，部分位置用 `→`、`←` 这样的字符箭头代替图标。用户要求：

1. 能使用 miuix-vue 自带图标的地方优先用 miuix 图标，其余用 [Tabler Icons](https://github.com/tabler/tabler-icons) 补齐。
2. 正文需要一种 Markdown 语法，可以指定并显示任意一个已注册图标。
3. 保持扁平、无渐变，图标要跟随文字颜色。

直接在每个组件里继续写 SVG 无法复用，也无法让 Markdown 作者选择图标；只引入 Tabler 又会让 miuix 风格（文件夹、复制、完成等）缺席。

## 选项

### 图标来源与封装

1. 继续手写内联 SVG，Markdown 不提供图标能力。
2. 只使用 miuix-vue 扩展图标，不接受 Tabler。
3. 新建全局 `Icon.vue`：内部维护 Tabler 精选集 + 全部 miuix 扩展图标的注册表，统一 props 与兜底。

### Markdown 语法

1. 自定义 remark 插件，把 `:icon[...]` 转成 HTML。
2. 使用 MDC 自带的行内组件语法 `:icon{name="..."}`，由 Nuxt Content 的组件解析链处理。
3. 用短代码或 HTML `<img>` 引用 SVG 文件。

## 决策

### 图标来源与封装

选择方案 3：

- `app/utils/icon-registry.ts` 从 `@tabler/icons-vue` 静态具名导入约 175 个常用图标，构建 `TABLER_COMPONENTS`，再用 `toKebabCase()` 生成 `TABLER_ICONS`（`brand-github`、`arrow-right`）。
- `MIUIX_ICONS` 直接来自 `allExtendedIcons`，包含 miuix-vue 的全部 155 个扩展图标，键为 PascalCase 名称。
- `FALLBACK_ICON` 为 `IconHelpCircle`，未知名称不会让页面或构建失败。
- `app/components/Icon.vue` 是全局组件，props 为 `name`、`size`（默认 16）、`strokeWidth`（默认 1.8）、`weight`、`color`、`label`。`miuix:` 前缀走 `MiuixIcon`，其余走 Tabler 组件；`tabler:` 前缀可选。
- `.app-icon` 统一 `display: inline-block`、`flex: none`、`vertical-align: -0.15em`，保证正文内联时与文字基线对齐。
- 组件中的内联 SVG 与字符箭头逐步替换为 `<Icon>`：主题切换、TopBar、Profile、文章元信息、分类/标签/TOC、文章卡片、回到顶部、代码复制、Callout、Spoiler、LinkCard、标题锚点、首页/列表/文章页、Footer。
- `LinkCard` 的 `icon` 参数改为注册表名称（如 `brand-nuxt`、`miuix:Folder`）；找不到时回退到标题首字母。`app.config.ts` 的社交链接直接写 `brand-github` / `rss`。
- Footer 用图标徽标列出 Nuxt 4、Nuxt Content、miuix-vue 与 GitHub Pages。

### Markdown 语法

选择方案 2：

- 正文写 `:icon{name="device-desktop"}`，默认名称是 Tabler kebab-case；`miuix:Folder` 选择 miuix 图标。
- Nuxt Content 的 `ContentRenderer` 会把本地组件按 PascalCase 收集进 `componentsMap`，`MDCRenderer` 再用 `resolveComponent(pascalCase('icon'))` 找到 `Icon`，因此小写 `:icon` 可以正常渲染，不需要额外全局注册。
- `remark-mdc` 的行内组件 tokenizer 只在 `:` 前是行首、空白、换行、`[`、`*`、`_` 或 `(` 时启动。中文全角标点（如 `：`、`、`）后必须补一个空格，否则 `:icon{...}` 会保留为字面文本。
- 示例文章 `content/blog/markdown-showcase.md` 增加了图标章节、miuix/品牌/语义图标列表，以及 Mermaid 形状与子图示例。

## 后果

- 新增 Tabler 图标时，需要在 `icon-registry.ts` 的具名导入和 `TABLER_COMPONENTS` 中各加一行；miuix 图标无需手动登记。
- 图标名称是公开的 Markdown API：重命名会破坏已有文章，应优先新增别名而不是直接改名。
- 未知名称渲染 `help-circle`，内容不会中断，但拼写错误不会被构建报错，需要在预览时留意。
- `remark-mdc` 的前置字符限制是内容层最容易踩的坑；中文作者必须在全角标点后留空格。
- 精选 Tabler 图标是静态具名导入，能参与 tree-shaking；但仍会增加客户端 bundle，后续若图标数量继续增长，应改为按需异步加载或拆分图标包。
- `Icon.vue` 的 `size` 是数字像素，和 Tailwind 的 `size-*` 不共用；新组件优先使用 `<Icon :size="16">`，不要再写内联 SVG。
- `LinkCard` 仍包在 `<ClientOnly>` 中，静态 HTML 不包含卡片内容；这是既有行为，与图标系统无关。
