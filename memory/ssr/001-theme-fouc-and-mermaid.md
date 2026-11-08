# 主题初始化、FOUC 与 Mermaid 主题同步

- 日期：2026-11-07
- 状态：部分废弃（主题存储与切换逻辑被 [ssr/004](004-three-mode-theme-and-on-primary.md) 扩展为三态；class 驱动、内联脚本与 Mermaid 同步仍然有效）
- 相关文件：`nuxt.config.ts`、`app/app.vue`、`app/composables/useTheme.ts`、`app/components/layout/ThemeToggle.vue`、`app/assets/css/main.css`

## 背景

暗色模式如果只在客户端 `onMounted` 里读取 `localStorage`，首屏会先以亮色绘制再切换，出现明显闪烁（FOUC）。同时 miuix-vue 使用自己的 `.m-theme-dark` class，而 Mermaid 模块不会读取本站的 `.dark` class，需要单独同步主题。

## 选项

1. 使用 `@nuxtjs/color-mode`：自动处理 class 与 SSR，但增加依赖，且与 miuix-vue 的 `m-theme-dark` 仍需额外桥接。
2. 自建：在 `<head>` 内联一段无依赖脚本，在首帧前设置 class；组件只读取/切换 class。
3. 完全客户端渲染主题，接受闪烁。

## 决策

选择方案 2：

- `nuxt.config.ts` 的 `THEME_INIT_SCRIPT` 读取 `localStorage.theme`，没有则读 `prefers-color-scheme`，同时添加/移除 `dark` 与 `m-theme-dark`。
- 脚本通过 `app.head.script` 注入，`tagPriority: 'critical'`，放在首屏渲染前。
- `useTheme()` 不在 setup 顶层访问 `document`；只在 `onMounted` 同步 `isDark`，避免 hydration mismatch。
- 切换图标不根据 `isDark` 渲染不同 DOM，而是两个 SVG 并用 `dark:hidden` / `dark:block` 由 CSS 控制，保证服务端与客户端初始标记一致。
- `useTheme().toggle()` 与 `onMounted` 都调用 `useMermaidTheme().setMermaidTheme('dark' | 'light')`，因为 Mermaid 无法读取本站 class。

## 后果

- 首屏不会闪烁；服务端输出始终是「无主题偏好」的标记，实际颜色由 head 脚本在绘制前决定。
- 新增依赖主题的库时，必须检查它是否能读取 `.dark` 或 CSS 变量，否则要像 Mermaid 一样手动同步。
- 主题状态没有使用 Pinia/useState 持久化，刷新后以 `localStorage` 为准。
