# 三态主题（系统/浅色/深色）、实时系统跟随与 on-primary 对比度

- 日期：2026-11-08
- 状态：部分废弃（三态主题、系统跟随与自定义 popover 仍然有效；暗色主色使用深色文字的决定已被统一白色 on-primary 取代）
- 相关文件：`app/composables/useTheme.ts`、`app/components/layout/ThemeToggle.vue`、`nuxt.config.ts`、`app/assets/css/main.css`、`app/components/layout/TopBar.vue`、`app/pages/index.vue`、`app/error.vue`

## 背景

旧实现只有「亮/暗」二元切换，`ThemeToggle` 是一个直接翻转 class 的 `MiuixIconButton`，`localStorage` 只存 `theme`。用户要求主题控制提供「系统 / 浅色 / 深色」三个选项，其中「系统」必须实时跟随 `prefers-color-scheme`，而不是只在首次加载时读取一次。

另一个问题在暗色主色：本站暗色 `--app-primary` 是 `#6ea8ff`（浅蓝），而 miuix 与 Tailwind 的主色按钮/标签都使用白色文字，白字压在浅蓝上对比度约 2:1，视觉上发灰。miuix 自带的暗色主题使用更深的 `#277af7` 配白字，但本站的强调色已确定为 `#6ea8ff`，不适合为了按钮再改一次色板。

## 选项

### 主题状态

1. 使用 miuix-vue 的 `setThemeMode` / 内置主题 API：组件内建，但没有三态语义、没有 `localStorage` 持久化，也无法控制首屏内联脚本。
2. 扩展已有的 `useTheme` composable：保留 class 驱动与内联 head 脚本，自行维护三态、存储、系统监听与 Mermaid 同步。
3. 引入 `@nuxtjs/color-mode`：功能完整，但增加依赖，仍需桥接 miuix 的 `m-theme-dark`。

### 主色文字

1. 把暗色主色改回 miuix 的 `#277af7`，继续用白字。
2. 保留 `#6ea8ff`，新增 `--app-on-primary`，暗色下用深色文字。

## 决策

### 三态主题

选择方案 2：

- `ThemeMode = 'system' | 'light' | 'dark'`，`useTheme()` 返回 `mode`、`isDark`、`setMode`。
- 存储键改为 `theme-mode`；读取时兼容旧的 `theme`（`light` / `dark`），保证老访客的选择不丢失。
- `THEME_INIT_SCRIPT` 在首帧前完成：先读 `theme-mode`，再回退 `theme`，否则按 `matchMedia` 解析；设置 `dark` / `m-theme-dark`，并写入 `data-theme-mode`。
- `data-theme-mode` 驱动触发图标（`theme-mode-icon--system/light/dark`），服务端标记始终一致，不依赖 `isDark` 渲染不同 DOM。
- `useTheme` 在 `onMounted` 建立 `matchMedia('(prefers-color-scheme: dark)')` 监听；只有 `mode === 'system'` 时才响应变化，切换后立即更新 class、`isDark` 与 Mermaid 主题。
- 触发按钮仍用 `MiuixIconButton`；miuix 没有 popover primitive，因此菜单用自定义 Tailwind 实现，带 `role="menu"`、`menuitemradio`、`aria-checked`、`aria-expanded`，并支持外部点击与 Escape 关闭。

### on-primary

选择方案 2：

- ~~新增 `--app-on-primary`：明色 `#ffffff`，暗色 `#0b1220`。~~ **已废弃**：后续统一为明暗 `#ffffff`，见「后续修订」。
- ~~`--m-color-on-primary` 映射到 `--app-on-primary`，使 `MiuixButton type="primary"` 在暗色下自动使用深色文字。~~ **已废弃**：现在映射到白色。
- 所有主色填充上的 `text-white` 改为 `text-app-on-primary`（TopBar/FooterBar 徽标、LinkCard 图标、列表空状态 CTA、标签激活态、文章底部 CTA、首页主按钮）。

## 后续修订（2026-11-08）

「暗色主色使用深色文字」的决定已被 [layout/006](../layout/006-icon-system.md) 的视觉收敛取代，原决策保留作为历史记录：

- `--app-on-primary` 在 `:root` 与 `.dark` 中都改为 `#ffffff`。
- `--m-color-on-secondary` 固定为 `#ffffff`，因为未选中开关的滑块是它唯一的消费者。
- `MiuixButton type="primary"`、滑块拇指、开关拇指在明暗两套主题中都是白色。
- 代价是暗色浅蓝 `#6ea8ff` 上的白字对比度低于 WCAG AA；这是用户明确要求的视觉一致性取舍，后续若调整强调色需重新评估。
- 三态主题、`theme-mode` 存储、`matchMedia` 实时跟随与 popover ARIA 仍然有效。

## 后果

- 「系统」模式会随操作系统外观实时变化，无需刷新；刷新后仍由 head 脚本在绘制前决定，不会闪烁。
- ~~暗色主色按钮与标签变成浅蓝底深色字，对比度明显提升，同时保留已确定的 `#6ea8ff` 强调色。~~ **已废弃**：后续统一为浅蓝底白字，见「后续修订」。
- 服务端输出不包含 `isDark` 分支，避免 hydration mismatch；`isDark` 只用于客户端状态与 Mermaid 同步。
- 旧 `theme` 键保留为回退路径，后续确认无老数据后可以删除。
- 新增任何「主色填充 + 文字」的组合时，必须使用 `text-app-on-primary`，不要直接写 `text-white`。
- 主题菜单是自定义 popover，未来 miuix-vue 若提供 popover 原语，应优先替换并保留现有 ARIA 语义。
