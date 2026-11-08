# 站点身份修正：站点叫 AEBC08，Mifumi 是框架名

- 日期：2026-11-08
- 状态：部分废弃（顶栏/页脚 Logo 部分待改，见 [layout/009](../layout/009-topbar-footer-avatar-and-footer-links.md)）
- 相关文件：`app/app.config.ts`、`nuxt.config.ts`、`README.md`、`content/pages/about.md`、`content/posts/hello.md`、`app/components/layout/TopBar.vue`、`app/components/layout/FooterBar.vue`、`public/banner.svg`、`public/favicon.svg`、`public/covers/avatar.png`

## 背景

上一轮把站点标题定成了 **Mifumi**，但用户澄清：

- 这个站点是个人博客，名字应该叫 **AEBC08**（或同类个人标识）。
- **Mifumi** 只是这个博客框架的名称，简单提一句即可，不应继续作为站点主标题。
- 头像直接从 GitHub 取一份。

这修正了 [architecture/003](003-mifumi-identity.md) 中「站点标题 = Mifumi」的决定。

## 选项

1. 继续把 Mifumi 作为站点标题，只在 README 里说明这是框架。
2. 站点标题、作者、Logo 全部改为 AEBC08；Mifumi 只作为框架名出现在关于页与 README。
3. 为站点另起一个与 AEBC08、Mifumi 都不同的名字。

## 决策

选择方案 2：

- `app.config.ts`：
  - `site.title` 改为 `AEBC08`，`author` 改为 `AEBC08`。
  - `profile.name` 改为 `AEBC08`，`bio` 改为「在个人博客记录开发、工具与日常折腾。」，`status` 改为「正在更新博客」。
  - `profile.avatar` 改为 `/covers/avatar.png`。
- `nuxt.config.ts` 的 `head.title` 改为 `AEBC08`；页面标题模板变为「页面名 · AEBC08」。
- `TopBar` 与 `FooterBar` 的字母 Logo 从 `M` 改为 `A`。
- `public/banner.svg` 的文字改为 `AEBC08`，右侧装饰从 `M` 形改为 `A` 形；`public/favicon.svg` 的字母与 `aria-label` 改为 `A` / `AEBC08`。
- 头像通过 `https://github.com/AEBC08.png?size=200` 下载到 `public/covers/avatar.png`（200×200 PNG），删除旧的 `public/covers/avatar.svg`。
- `content/pages/about.md`：正文改为「我是 AEBC08，这里是我的个人博客」，并单独说明「这个博客使用的框架叫 Mifumi」。
- `content/posts/hello.md`：标题改为「你好，这里是 AEBC08」，正文提一句「这个博客基于 Mifumi 框架构建」。
- README 标题改为「AEBC08 的个人博客」，首段说明使用 Mifumi 框架，并保留一句「Mifumi 是这个博客使用的静态博客框架名称」。
- `package.json` 的 `name: "mifumi"` 保留，因为它是框架名，不是站点名。

## 后果

- [architecture/003](003-mifumi-identity.md) 的「站点标题 = Mifumi」部分已被本记录取代，其余身份信息（GitHub 链接、部署地址、导航）仍然有效。
- 头像是本地副本，不会随 GitHub 头像自动更新；更换头像后需要重新下载并覆盖 `public/covers/avatar.png`。
- `TopBar` / `FooterBar` 的字母 `A` 只是临时方案：用户后续要求这两处也显示 GitHub 头像，实施方式见 [layout/009](../layout/009-topbar-footer-avatar-and-footer-links.md)。
- 站点标题与作者都是 AEBC08，页脚版权显示为「© 年份 AEBC08」。
- Mifumi 只作为框架名出现在关于页、README 与文章正文中，不再出现在浏览器标题栏。
