# Fuwari 交互细节补齐：标题竖条、回到顶部与相邻文章

- 日期：2026-11-08
- 状态：部分废弃（标题竖条的渐变与回到顶部的 `.glass` 外壳已被 [004](004-flat-design-and-sidebar.md) 改为纯色/扁平；回到顶部与相邻文章功能仍有效）
- 相关文件：`app/assets/css/main.css`、`app/components/layout/BackToTop.vue`、`app/layouts/default.vue`、`app/pages/blog/[...slug].vue`、`app/components/sidebar/*Widget.vue`

## 背景

站点整体已按 [layout/002](002-fuwari-hyperos-redesign.md) 完成 Fuwari + HyperOS 风格重设计，但对照 Fuwari 实际站点仍缺少三处细节：

1. 侧边栏 widget 标题只有图标与文字，没有 Fuwari 的左侧强调竖条。
2. 长文章缺少常驻的「回到顶部」入口。
3. 文章末尾只有返回列表按钮，没有上一篇/下一篇导航。

## 选项

### 侧边栏标题

1. 给每个 widget 单独写装饰元素。
2. 提取 `.widget-title` 工具类，用 `::before` 绘制渐变竖条。

### 回到顶部

1. 使用浏览器原生锚点。
2. 新建 `BackToTop` 组件，基于 `scrollY` 显隐，`scrollTo({ behavior: 'smooth' })`。

### 相邻文章

1. 在 Content 查询里额外取相邻记录。
2. 复用 `useBlogList()` 的已排序列表，在页面内计算当前文章索引。

## 决策

- **标题竖条**：选择方案 2。`TocWidget`、`CategoriesWidget`、`TagsWidget` 的标题加 `widget-title` 类；`main.css` 用 `::before` 绘制 3px 圆角竖条，渐变从 `--app-primary` 到 `--app-cyan`。
- **回到顶部**：选择方案 2。`BackToTop.vue` 用 `requestAnimationFrame` 节流滚动监听，超过 480px 显示；外层 `glass` 胶囊 + `MiuixIconButton`；在 `default` 布局中挂载。组件卸载时移除监听并取消未执行的 frame。
- **相邻文章**：选择方案 2。`[...slug].vue` 同时调用 `useBlogList()`，用 `normalizeContentPath` 对齐当前路径后取 `posts[index - 1]`（较新）与 `posts[index + 1]`（较早）；卡片复用 `.app-card` / `.app-card-hover`，移动端单列、`sm` 以上双列。

## 后果

- 侧边栏视觉层次更接近 Fuwari，且竖条样式只维护一处。
- 回到顶部按钮不参与 SSR 首屏布局，仅在客户端滚动后出现；不影响静态预渲染。
- 相邻文章导航复用已有 `blog-list` 缓存键，不新增请求。
- 相邻文章顺序依赖 published 降序；草稿已在 `useBlogList` 中过滤，不会出现在导航里。

## 后续变更

2026-11-08 的 [004](004-flat-design-and-sidebar.md) 将本记录的两处视觉细节改为扁平：

- `.widget-title::before` 从 `--app-primary` → `--app-cyan` 渐变改为纯 `--app-primary`。
- `BackToTop` 外层从 `.glass` 改为 `.app-card`。
- 回到顶部的滚动逻辑、`requestAnimationFrame` 节流与相邻文章导航保持不变。
