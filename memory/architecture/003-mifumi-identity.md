# 项目定名 Mifumi 与站点身份信息

> **部分废弃**：站点标题后来改为 **AEBC08**，Mifumi 仅作为框架名保留，详见 [004 站点身份修正](004-site-identity-aebc08.md)。本记录中的 GitHub 链接、部署地址、导航与 `/posts` 相关决定仍然有效。

- 日期：2026-11-08
- 状态：采纳
- 相关文件：`app/app.config.ts`、`nuxt.config.ts`、`package.json`、`README.md`、`public/banner.svg`、`public/favicon.svg`、`public/covers/avatar.svg`、`content/posts/hello.md`、`.github/workflows/deploy.yml`

## 背景

项目最初以「Miuix Blog」作为通用博客框架演示，站点标题、作者、头像文案、GitHub 链接与部署地址都指向占位信息。用户决定不再单独发布这个框架，而是把它作为自己的个人博客：

- 项目名：**Mifumi**
- 仓库名：**blog**
- GitHub：<https://github.com/AEBC08>
- 部署地址：<https://aebc08.github.io/blog/>

因此需要把站点标题、描述、作者、个人资料、导航、社交链接、静态资产文案与 README 全部替换为真实身份信息。

## 选项

1. 保留通用框架文案，仅在 README 中说明使用者。
2. 把身份信息集中到 `app.config.ts`，其余静态资产与构建元数据同步替换。
3. 为个人博客再引入一层 CMS 或远程配置。

## 决策

选择方案 2：

- `app.config.ts`：
  - `site.title` 改为 `Mifumi`，`author` 改为 `AEBC08`，描述改为「AEBC08 的个人博客，记录开发、工具与日常折腾。」
  - `profile.name` 改为 `AEBC08`，状态改为「正在更新 Mifumi」。
  - GitHub 链接改为 `https://github.com/AEBC08`，第二个链接从 RSS 改为「关于」`/about`。
  - 导航改为「首页 / 文章 / 关于」，文章入口为 `/posts`，关于页为 `/about`。
- `nuxt.config.ts` 的 `head.title` 与 `description` 同步为 Mifumi 身份信息。
- `package.json` 的 `name` 改为 `mifumi`。
- `public/banner.svg`、`favicon.svg`、`covers/avatar.svg` 的 `aria-label` 与横幅文字改为 Mifumi / MIFUMI。
- 首页 hero 的「写作指南」按钮改为「关于我」，指向 `/about`。
- `content/posts/hello.md` 的标题、描述与站内链接同步为 Mifumi 与 `/posts/*`。
- README 首段改为 Mifumi 身份说明，并写明部署地址。
- GitHub Actions 继续使用 `NUXT_APP_BASE_URL=/${{ github.event.repository.name }}/`，仓库为 `blog` 时自动得到 `/blog/`。

## 后果

- 身份信息只有 `app.config.ts` 与 `nuxt.config.ts` 两处需要维护；其余组件通过 `useAppConfig()` 读取。
- 部署 URL 与仓库名绑定：若仓库改名，工作流的 baseURL 会自动跟随，但 README 与关于页中的绝对地址需要手动更新。
- 内部 Content 集合名仍保留为 `blog`，但源目录与路由已改为 `posts`，两者不是同一个概念，详见 [deployment/004](../deployment/004-baseurl-blog-route-collision.md)。
- 静态资产中的字母标识仍为 `M`，与 Mifumi 首字母一致，无需额外替换图形。
