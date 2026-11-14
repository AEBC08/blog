# 012 目录高亮、骨架屏、图片淡入、评论系统与友链页

**日期**：2026-11-14
**状态**：已实现

## 背景

上一轮（layout/011）做完页面级动效后，还有四处体验缺口：目录高亮算法有边界问题、GithubRepo 卡片客户端导航时有空窗、图片无懒加载/淡入、缺少评论与友链能力。

## 决策

1. **目录高亮重构**（`TocWidget.vue`）：从 IntersectionObserver「取第一个可见项」改为滚动位置算法——越过基准线（120px，与 sticky 顶栏对齐）的最后一个标题即当前章节；未越过任何标题时高亮第一项；滚到页底强制选中最后一项（避免尾段高亮回跳）。目录渲染拍平为两级（h2/h3），nav 容器 `max-h-[60vh]` 可滚动。
   - **重要教训**：最初用 `scrollIntoView({ block: 'nearest' })` 把当前项滚进视野，它会把整条祖先滚动链都滚一遍，导致**页面滚动被抢走产生"回弹"**（用户实测报告）。修复为只改 `nav.scrollTop` 的数学计算，绝不触碰页面滚动。
2. **GithubRepo 骨架屏**：数据是构建期抓取、序列化进 payload 的，首访直接完整；骨架只覆盖客户端导航时 payload chunk 到达的窗口——用 `useAsyncData` 的 `status === 'pending'` 切换，骨架形状与真实卡片一致防跳动。注意失败（status success + data null）不走骨架，走 fallback 字段。
3. **图片**：新增 `ProseImg.vue` 覆盖（正文图统一 `loading="lazy"` + `decoding="async"`）与 `plugins/img-fade.ts` 的 `v-img-fade` 指令（加载完成后淡入）。隐藏态只由 JS 添加（同 v-reveal 原则，无 JS 不白屏）；`img.complete` 的缓存图不做淡入避免闪烁。首页精选卡封面改 `eager`（首屏 LCP）。
4. **评论系统**：选 giscus 而非 Waline/Twikoo——纯静态 GitHub Pages 无后端可用。`CommentSection.vue`：IntersectionObserver 懒挂载脚本（rootMargin 240px 预加载）、MutationObserver 监听 `<html>` class 用 postMessage 同步明暗主题。**四个 giscus 参数（repo/repoId/category/categoryId）没填全就不渲染**，避免线上空壳。`layout: interactive` 的文章不显示评论区。
5. **友链页**：`/friends` + `FriendCard.vue`，数据在 `site.config.friends`（intro + links），空数组显示访客向占位（"想成为第一个朋友？到「关于」页找我吧"）。第一版空状态误写成开发者向提示（"在 site.config.ts 的 friends.links 里添加条目"），用户指出后改为访客文案；同时按用户反馈收紧了卡片尺寸（p-4→p-3.5、头像 48→40、页头内边距减小）。
6. **本站信息栏目**（用户追加）：友链页顶部展示本站信息。第一版只有一个整体复制按钮，用户要求「逐项展示 + 可单独配置」后重构：`site.config.siteInfo` 独立配置块（name/url/avatar/description，留空回退 site/profile），字段逐行展示、每行独立复制按钮 + 右上「全部复制」；复制时站内相对路径补 `location.origin` 成为完整 URL（只在点击处理中调用，避免 SSR hydration 不一致）。复制反馈按字段独立闪烁 2 秒。

## 后果

- 目录高亮在快速滚动、向上滚、页底三个边界场景都稳定；回弹 bug 已实测修复（scrollY 单调递增）。
- giscus 参数目前留空，**上线评论功能前必须去 giscus.app 生成并填入**，这是遗留的显式步骤。
- 侧边栏 sticky 仍是既有的视口高度门槛设计（≥900px），矮视口下侧边栏随页面滚走属预期，未改动。
- 新增指令（v-reveal、v-img-fade）都遵循「SSR 输出永远可见」原则，新组件可直接复用。
