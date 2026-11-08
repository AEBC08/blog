# 浏览器标签页图标改用站点头像，并修正头像文件格式

- 日期：2026-11-08
- 状态：采纳
- 相关文件：`app/app.vue`、`app/app.config.ts`、`public/covers/avatar.jpg`（原 `avatar.png`）、`public/favicon.svg`（删除）

## 背景

用户要求「浏览器标签页图标也改成我的头像」。原来的 favicon 是 `public/favicon.svg`：蓝底 + 白色字母 A，与真实身份无关。另外发现 `public/covers/avatar.png` 的文件头其实是 JPEG（`ff d8 ff`），只是扩展名写成了 `.png`，服务器会以 `image/png` 返回一张 JPEG，浏览器靠内容嗅探才能显示。

## 选项

1. 保留 SVG favicon，把字母 A 换成头像的 base64 内嵌 `<image>`。
2. **把头像文件改名成 `.jpg`，favicon 直接复用它。**
3. 用工具把头像裁成 64×64 PNG 再单独存一份 favicon。

## 决策

选择方案 2：

- `public/covers/avatar.png` → `public/covers/avatar.jpg`，`profile.avatar` 同步改为 `/covers/avatar.jpg`，全站（顶栏、页脚、首页 hero、关于页、侧边栏）都通过 `resolveCoverImage()` 读取，只改配置一处。
- `app.vue` 的 `useHead` 输出两个 link：`rel="icon" type="image/jpeg"` 与 `rel="apple-touch-icon"`，都指向同一份头像；`profile.avatar` 为空时不输出 link（不产生 404）。
- 删除 `public/favicon.svg`，避免出现两个图标来源。
- `iconLinks` 用 `as const` 标注，否则 `rel` 被推断成 `string`，`useHead` 的 `ResolvableLink` 联合类型会报 TS2322。

## 后果

- 换头像只需要覆盖 `public/covers/avatar.jpg`，标签页图标自动跟着变。
- 项目里没有图像处理依赖（无 sharp / ImageMagick），所以不做 64×64 裁切；浏览器会把 200×200 的 JPEG 缩放到 16×16，边缘略软但可辨认。
- Safari 不支持 SVG favicon，这里用 `apple-touch-icon` 兜底；若以后要更清晰的位图，可以在有 sharp 的环境里生成 32/180 两档 PNG。
- `avatar.png` 的历史引用（memory 与旧文档）保留为历史记录，实际文件中已改名。
