# 顶栏/页脚改用 GitHub 头像，页脚改为超链接与技术栈文本

- 日期：2026-11-08
- 状态：待实现（交接）
- 相关文件：`app/components/layout/TopBar.vue`、`app/components/layout/FooterBar.vue`、`app/app.config.ts`、`public/covers/avatar.png`

## 背景

[architecture/004](../architecture/004-site-identity-aebc08.md) 把 `TopBar` / `FooterBar` 的字母 Logo 从 `M` 改成了 `A`，但用户仍然说「顶栏和页脚的头像没改过来」——他们期望这两个位置显示 GitHub 头像，而不是字母方块。另外页脚现在是一排 `<span>` + 图标，希望改成可点击的超链接文本。

## 选项

1. 保留字母 `A`，只在侧边栏 Profile 使用头像。
2. 顶栏、页脚都换成 `public/covers/avatar.png` 图片，尺寸沿用现有方块（顶栏 36px、页脚 28px）。
3. 顶栏用头像、页脚只保留文字版权。

## 决策

选择方案 2：

- `TopBar`：`<span class="...bg-app-primary...">A</span>` 换成 `<img :src="avatar" alt="AEBC08" class="size-9 rounded-xl object-cover">`，与 `ProfileWidget` 一样通过 `resolveCoverImage(appConfig.profile.avatar)` 解析路径（带 `baseURL`），不要硬编码 `/covers/avatar.png`。
- `FooterBar`：同样换成 `size-7` 圆角头像，`alt` 用 `appConfig.profile.name`。
- 头像本身仍是本地副本 `public/covers/avatar.png`，不自动跟随 GitHub 更新（见 [architecture/004](../architecture/004-site-identity-aebc08.md)）。
- 页脚技术栈改成超链接文本（可带 `Icon`，但文字本身必须是 `<a>`）：
  - Nuxt 4 → `https://nuxt.com`
  - Nuxt Content → `https://content.nuxt.com`
  - miuix-vue → `https://github.com/YuKongA/miuix-vue`
  - GitHub Pages → `https://pages.github.com`
  - 统一 `target="_blank"` + `rel="noopener noreferrer"`，`hover:text-app-primary-text`，保留 `text-[11px] text-app-text-faint`。
- 页脚新增版权与协议一行：「© 年份 AEBC08 · 内容采用 CC BY-NC-SA 4.0 许可协议」，协议文字链接到 `https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh-hans`（英文界面用 `/deed.en`）。

## 后果

- `TopBar` / `FooterBar` 不再依赖 `bg-app-primary` 方块，暗色下头像边缘建议保留 `ring-1 ring-app-border` 或 `border border-app-border`，避免深色头像糊在深色背景上。
- 页脚多了一行协议声明，移动端需要 `flex-wrap`，不要产生横向溢出。
- 头像为空时（`profile.avatar` 未配置）需要有字母兜底，否则会渲染出破图；建议保留 `v-if="avatar"` + `v-else` 字母块。
