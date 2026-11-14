# 侧边栏音乐播放器：构建期取歌单，运行时用官方直链播放

- 日期：2026-11-15
- 状态：采纳
- 相关文件：`app/components/sidebar/MusicWidget.vue`、`app/components/sidebar/SidebarPanel.vue`、`site.config.ts`、`app/utils/icon-registry.ts`

## 背景

用户要在侧边栏个人信息和分类之间放一块音乐卡，播放自己网易云歌单（`18597875286`），要求：不硬编码曲目、只使用官方接口、封面/歌名/作者、可拖动的进度条（颜色暗色白、浅色黑）、暂停/上一首/下一首/循环/播放列表按钮同样配色且无背景、展开播放列表时卡片变长并给出可滚动列表。

## 选项

1. 引入 NeteaseCloudMusicApi 之类的第三方反代服务。功能最全，但需要额外部署，且违反「只用官方接口」。
2. 浏览器直接 `fetch('https://music.163.com/api/...')`。该接口**没有 CORS 响应头**，静态站无法跨域读取。
3. **构建期在 Nitro 里取歌单元数据，运行时用官方直链播音频。**

## 决策

选择方案 3。

- 元数据：`await useAsyncData` 在预渲染阶段请求 `https://music.163.com/api/playlist/detail?id=<歌单>`，把歌名、作者、封面、时长写进页面 payload。访客不请求接口，也不存在跨域问题。
- 音频：`https://music.163.com/song/media/outer/url?id=<trackId>.mp3` 是官方外链播放地址，302 到 CDN。`<audio>` 跟随跳转即可，媒体元素不需要 CORS。曲目 ID 从 payload 里拿，浏览器侧不需要额外请求。
- 歌单 ID 放 `site.config.ts` 的 `music.playlistId`，`music.enabled` 控制是否渲染；组件本身不含任何曲目数据。
- 封面统一 `http:` → `https:` 并追加 `?param=120y120` / `64y64`，省流量，也避免 HTTPS 页面加载 http 图片。
- 进度条自己用 Tailwind 画（复用 `--app-text` 令牌：浅色近黑、暗色近白），没有用 `MiuixProgressIndicator`，因为那个组件不支持拖动；高度、圆角与 miuix 进度条保持一致。
- 拖动用 Pointer Events + `setPointerCapture`，`touch-none select-none` 防止移动端滚动干扰；同时加了 `role="slider"` 与左右方向键 ±5s。
- 循环模式三态：列表循环 → 单曲 → 随机，图标用 Tabler 的 `repeat` / `repeat-once` / `arrows-shuffle`，按钮统一 `text-app-text`，无背景，hover 只改透明度。
- 播放列表用 `grid-rows-[0fr] → [1fr]` 过渡，展开后卡片向下变长，列表 `max-h-56 overflow-y-auto`。
- 曲目取不到时（版权/网络）`@error` 自动跳到下一首，跳满一轮后停下并给一行提示，不会死循环。

## 后果

- 构建需要访问 `music.163.com`：CI 有网络没问题；本地断网时卡片会退化成一行动画文案（`playlist` 为 null），不报错。
- 302 目标是 `http://m*.music.126.net`：实测该 CDN 支持 HTTPS，Chrome/Firefox 会把混合内容自动升级；Safari 若拒绝则表现为「无法播放」，由 `@error` 兜底，不做进一步处理。
- 直链对会员曲目可能返回 404，歌单里若加入 VIP 歌，会在运行时报一次跳过。
- 元数据是构建期快照：歌单改名或增删歌曲，要等下一次部署才更新。
- 新增 8 个 Tabler 图标到 `icon-registry.ts`（player-play / player-pause / player-skip-back / player-skip-forward / repeat / repeat-once / arrows-shuffle / playlist），遵守 [006](006-icon-system.md) 的注册表规则。
