---
title: 你好，Miuix Blog
published: 2026-10-01T09:00:00.000Z
description: 一个把 Nuxt Content 的写作体验与 miuix-vue 视觉语言放在一起的静态博客。
tags:
  - Nuxt
  - Vue
  - 博客
category: 公告
draft: false
image: /covers/hello.svg
layout: default
lang: zh-CN
---

这是一篇示例文章。它的存在证明了一件事：**在 `content/blog/` 下放一个 Markdown 文件，刷新页面，它就会出现在博客里。**

## 为什么是 Nuxt Content

写作应该只关心内容。文件名决定 URL，frontmatter 决定元数据，其余交给构建期生成的数据库：

```ts
const posts = await queryCollection('blog')
  .where('draft', '=', false)
  .order('published', 'DESC')
  .all()
```

## 这个博客有什么

- 顶部导航 + 侧边栏 + 主内容的双栏布局
- 桌面端两栏、移动端单列，侧边栏自动下移
- 亮色 / 暗色主题，首屏无闪烁
- KaTeX 公式、Shiki 代码高亮、Mermaid 图表
- 通过 MDC 组件插入 Callout、Spoiler 与 LinkCard
- `layout: interactive` 可切换到 Vue 组件驱动的文章

::Callout{type="tip" title="从哪开始"}
先读[写作指南](/blog/guide)，再看[语法展示](/blog/markdown-showcase)。
::

## 下一篇

如果你想快速创建文章，在项目根目录运行：

```bash
pnpm new-post my-next-post
```

脚本会生成完整的 frontmatter，并默认把 `draft` 设为 `true`，避免未完成的稿子被发布。
