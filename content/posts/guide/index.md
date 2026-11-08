---
title: 写作指南
published: 2026-10-08T09:00:00.000Z
description: 如何新增文章、组织嵌套目录，以及 frontmatter 字段的含义。
tags:
  - 指南
  - Content
category: 文档
draft: false
image: /covers/guide.svg
layout: default
lang: zh-CN
---

## 文件即路由

Nuxt Content 会根据文件路径生成页面路径：

| 文件 | 路径 |
| --- | --- |
| `content/posts/hello.md` | `/posts/hello` |
| `content/posts/guide/index.md` | `/posts/guide` |
| `content/posts/notes/nuxt/content.md` | `/posts/notes/nuxt/content` |

嵌套目录不需要额外配置。`scripts/new-post.mjs` 会自动创建缺少的目录。

## frontmatter 字段

```yaml
---
title: 文章标题
published: 2026-10-08T09:00:00.000Z
description: 列表页摘要
tags:
  - Nuxt
category: 文档
draft: false
image: /covers/guide.svg
layout: default
lang: zh-CN
---
```

- `title`：文章标题，同时用于 `<title>`
- `published`：ISO 时间，列表按它降序排列
- `draft`：为 `true` 时不会出现在列表，也无法通过 URL 访问
- `layout`：`default` 使用 Markdown 渲染，`interactive` 使用 Vue 组件
- `image`：封面图，写 `public/` 下的绝对路径

## 任务列表

- [x] 建立内容集合
- [x] 支持嵌套 slug
- [ ] 写下一篇

## 引用

> 内容与展示分离，才能让写作保持轻量。

## 删除线

~~这是一段被删除的文字。~~
