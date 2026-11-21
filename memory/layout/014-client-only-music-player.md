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

## 改为同源快照（2026-11-21 晚，最终方案）

把浏览器日志翻出来后才看清真正的原因：从页面里发起的**所有跨源请求都失败**，`raw.githubusercontent.com`、`api.github.com`、`cdn.jsdelivr.net` 一视同仁，`Network.loadingFailed` 的 `corsErrorStatus` 是 `LocalNetworkAccessPermissionDenied`，`errorText` 是 `net::ERR_FAILED`；而直接在地址栏打开同一个 URL 却是 200。用户的 Edge 装了 AdGuard，请求走本地代理，Chrome/Edge 的 Local Network Access 判定为「访问本地网络」，于是全部拦掉。也就是说，问题不在 CORS 头，也不在缓存，而是**任何跨源都不可用**。

所以放弃了 `data` 分支 + `raw.githubusercontent.com` 这一层：

- 快照改放 **`public/music/playlist.json`**，随站点一起部署，浏览器只请求 `{baseURL}music/playlist.json`（站点部署在 `/blog/`，运行时用 `runtimeConfig.app.baseURL` 拼）。
- `.github/workflows/music.yml` 删除；`deploy.yml` 增加了 `schedule: cron '0 */6 * * *'`，并在 Build 前跑 `node scripts/sync-playlist.mjs`（`continue-on-error: true`，接口抽风时退回仓库里的上一版快照）。每 6 小时自动重建一次，不需要手动触发。
- `site.config.ts` 的 `music.dataUrl` 换成 `music.dataPath: '/music/playlist.json'`；保留按分钟分桶的 `?v=` 与 `cache: 'no-store'`，避免 Pages CDN 挡住新部署。
- `data` 分支保留但已无引用，可以随时删除。

代价：歌单更新最多滞后一个 cron 周期 + 一次构建；换来的是不依赖任何第三方域名，国内网络和广告拦截器都不会再影响它。

## 为什么不能在客户端直接请求网易云（2026-11-21 深夜）

用户希望能「浏览器直接 fetch 网易云接口」，这样改歌单立刻生效。实测下来这条路走不通，证据：

- `GET https://music.163.com/api/playlist/detail?id=…`：响应没有任何 `Access-Control-Allow-Origin`，浏览器读取会被 CORS 拦掉。
- 加 `callback=cb` 也没有 JSONP 包装（返回仍是裸 JSON），所以 `<script>` 注入也拿不到数据；`mode: 'no-cors'` 只能拿到 opaque 响应，读不了内容。
- 换域名（`interface.music.163.com`、`m.music.163.com`、`api/v6`）同样没有 CORS 头。
- 就算有 CORS，这台机器上的浏览器也会把**所有跨源 fetch** 判成 `LocalNetworkAccessPermissionDenied`（系统代理 / 广告拦截器让目标地址被识别为本地网络），`net::ERR_FAILED`。同源请求不受影响。

结论：静态站点想「客户端直连网易云」必须经过代理，而代理是跨源，会撞上同一条限制。所以保留「构建期同步 + 同源 JSON」，把 cron 从每 6 小时改成每 30 分钟（`*/30 * * * *`），并在定时构建里跳过 lint/typecheck（代码没变）。数据延迟约为「半个 cron 周期 + 一次构建（约 75 秒）」。

## 快照带歌单 id，卡片加外链（2026-11-21）

- `scripts/sync-playlist.mjs` 现在把 `id` 写进快照；变化判定也看 `id / name / cover / tracks`，所以歌单改名、换封面都会触发重写（之前只比 tracks，改名会被跳过）。名字本身一直取自官方接口的 `playlist.name`。
- `useMusicPlayer()` 暴露 `playlistUrl`：优先用快照里的 `id`，缺失时退回 `site.config.ts` 的 `music.playlistId`，指向 `https://music.163.com/m/playlist?id=<id>`。
- `MusicCard` 头部「N 首」右边加了 `arrow-up-right` 图标链接，`target="_blank"` + `rel="noopener noreferrer"`，侧边栏与顶栏弹层共用。

## 浏览器媒体控制中心（2026-11-22）

`MusicAudioHost` 里接了 Media Session API，Windows 的媒体浮层、Chrome 的媒体中心、锁屏和耳机按键都能控制这一份 audio：

- `metadata`：歌名 / 歌手 / 歌单名 / 封面（`?param=96y96`、`192`、`384` 三档），曲目或歌单名变化时刷新。
- `setActionHandler`：`play / pause / stop / previoustrack / nexttrack / seekbackward / seekforward / seekto`。前一首直接切上一首（2026-11-22 去掉了「先回到 0:00」的 3 秒规则）；`stop` 是暂停并回到 0。
- `playbackState` 跟 `playing` 同步；`setPositionState` 跟 `time` / `duration` 同步（拖动进度条也会更新）。
- 为了不让播放器只有「按比例跳」的能力，composable 新增 `seekTo(seconds)` 与 `seekBy(delta)`。
- 全部调用都做了特性检测和 try/catch：不支持的浏览器按原样跑，不报错。
