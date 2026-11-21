# 音乐播放器改为客户端取数 + 全站单实例音频

- 日期：2026-11-21
- 状态：采纳（取代 [013](013-sidebar-music-widget.md) 的构建期抓取）
- 相关文件：`app/composables/useMusicPlayer.ts`、`app/components/music/MusicCard.vue`、`app/components/music/MusicAudioHost.vue`、`app/components/layout/MusicMenu.vue`、`app/layouts/default.vue`、`site.config.ts`、`scripts/sync-playlist.mjs`、`.github/workflows/music.yml`

## 背景

013 把歌单数据放在构建期抓取，结果每改一次歌单都要重新构建部署一次。用户要求：播放器必须是 client only、音乐要能全站后台播放、顶栏加一个按钮展开音乐卡片。

## 选项

1. 浏览器直接请求 `https://music.163.com/api/playlist/detail`。**行不通**：该接口不返回任何 `Access-Control-Allow-*` 头；也试过 `interface.music.163.com`、`interface3`、`m.music.163.com`，全都没有 CORS；接口也不支持 `callback` JSONP。
2. 引入第三方 CORS 代理。能通，但违反「只用官方接口」，且多一个不稳定依赖。
3. **定时任务把官方接口结果同步成 JSON 快照，浏览器拉快照。**

## 决策

选择方案 3：

- `scripts/sync-playlist.mjs` 读 `site.config.ts` 里的 `music.playlistId`，请求官方接口，规范化成 `{ name, cover, tracks[] }`。
- `.github/workflows/music.yml` 每 6 小时跑一次（也能手动 dispatch），把结果写到 **`data` 分支** 的 `music/playlist.json`；内容没变化就不提交。
- 写 `data` 分支而不是 `main` 是关键：bot 推 `data` 不会触发 Pages 构建，所以更新歌单**完全不需要重新部署**。页面从 `raw.githubusercontent.com` 拉，该域名返回 `Access-Control-Allow-Origin: *`，缓存 5 分钟。
- 组件侧全部 `<ClientOnly>`：`SidebarPanel` 里是 `MusicCard variant="sidebar"`（带骨架 fallback），顶栏 `MusicMenu` 的弹出面板里是 `MusicCard variant="panel"`。数据、状态、播放都不参与 SSR，静态 HTML 里没有曲目。
- 状态放在 `useMusicPlayer()` 的 `useState`（playlist / index / playing / time / duration / mode），两个界面共用。
- `<audio>` 只在 `layouts/default.vue` 的 `MusicAudioHost` 里出现一次。布局实例在路由切换时不会重建，所以换页继续播；如果把 audio 放进侧边栏卡片，某些页面（如 404、无侧栏布局）就会中断。
- 顶栏按钮沿用 `MiuixIconButton` + `ThemeToggle` 的弹出层写法（点击外部/ESC 关闭），播放中在图标右上角点一个小圆点。
- 音频仍然是官方 `song/media/outer/url?id=…` 直链，`<audio>` 跟随 302，不需要 CORS。

## 后果

- 歌单改动最多滞后 6 小时，改 cron 可以缩短；不需要任何手动构建。
- 依赖 `data` 分支存在：分支被删或改名要去 `site.config.ts` 改 `music.dataUrl`，否则卡片显示「歌单暂时取不到」。
- `raw.githubusercontent.com` 在国内访问不稳，必要时把 `dataUrl` 换成 jsDelivr（`cdn.jsdelivr.net/gh/AEBC08/blog@data/music/playlist.json`），同样是 JSON 快照。
- 静态 HTML 里不再包含曲目，对 SEO 无影响（音乐本来也不需要被索引）。
- 302 目标仍是 `http://m*.music.126.net`，Chrome/Firefox 自动升级 HTTPS；Safari 若拒绝，表现为点播放无反应，`@error` 会跳到下一首。
- 旧文件 `app/components/sidebar/MusicWidget.vue` 已删除，职责拆成 composable（状态）+ host（音频）+ card（界面）+ menu（入口）。

## 缓存与重试修正（2026-11-21）

线上出现过「首次取数失败后，无论怎么刷新都只看到失败提示」：浏览器把 `raw.githubusercontent.com` 的失败响应按 5 分钟缓存了，`$fetch` 命中本地缓存，根本没有发出新请求。现在：

- 请求 URL 带按分钟分桶的 `?v=<bucket>`，并显式 `cache: 'no-store'`，每次 `load()` 都真的走网络；快照只有 2 KB，代价可以忽略。
- `load(force)` 增加强制重取；只有 `pending` 为真时才会短路，失败后不会锁死。
- 失败态在卡片里给了「重试」按钮；`window` 的 `online` 事件也会自动重取一次（离线恢复是最常见的首次失败原因）。
- 刷新时如果 `index` 越界（歌单变短）会回到第 0 首，并重置进度。

结论：这里的「本地缓存」是 HTTP 缓存，不是我们自己的 localStorage；播放器从前到后没有写任何浏览器存储。
