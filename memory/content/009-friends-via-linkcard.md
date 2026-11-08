# 友链改用 MDC LinkCard，删除 FriendLinks 组件

- 日期：2026-11-08
- 状态：采纳（部分取代 [003](003-about-page-pages-collection.md) 里的友链区块）
- 相关文件：`content/pages/about.md`、`app/pages/about.vue`、`app/app.config.ts`、`app/components/content/LinkCard.vue`（删除 `FriendLinks.vue`）

## 背景

关于页原来在 `ContentRenderer` 之后挂了一个独立组件 `FriendLinks`，数据来自 `app.config.ts` 的 `friends` 数组（始终为空），并且自己实现了一套卡片样式。用户认为友链完全可以直接用 MDC 的 `LinkCard`，不必单独维护组件与配置。

## 选项

1. 保留 `FriendLinks`，只把卡片样式换成 `LinkCard` 的外观。
2. **删掉 `FriendLinks` 与 `app.config.friends`，友链写进 `about.md` 用 `::LinkCard::`。**
3. 新增一个 `useFriends()` 数据源，仍然用组件渲染。

## 决策

选择方案 2。关于页继续是「Markdown 正文 + Vue 外壳」的混合模式（外壳负责头像、标题、卡片容器，正文全部由 `content/pages/about.md` 渲染），友链作为正文里的一个 `## 友链` 小节：

```md
::LinkCard{title="AEBC08" description="GitHub · 交换友链" href="https://github.com/AEBC08" icon="brand-github"}
::
```

- 删除 `app/components/content/FriendLinks.vue`，`about.vue` 不再渲染它。
- 删除 `app.config.ts` 里的 `FriendLink` 接口与 `friends` 数组，避免留下没人读的死配置。
- 以后加友链只需在 `about.md` 里复制一行 `::LinkCard`，不需要动 TypeScript。

## 后果

- 友链不再有「两列网格 + 头像位」的专用样式，观感与正文其它卡片一致（这是用户要的统一）。
- `LinkCard` 是 `<ClientOnly>`，友链区块在静态 HTML 里为空、水合后出现，和 001 的既有取舍一致。
- 如果以后友链变多需要筛选/排序，再回到组件方案，`content/003` 里的 pages 集合不受影响。
