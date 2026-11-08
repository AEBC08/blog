# GithubRepo 字段扩展：Fork 数、许可证与可选作者头像

- 日期：2026-11-08
- 状态：已废弃（被 content/008 取代）
- 相关文件：`app/components/content/GithubRepo.vue`、`app/utils/icon-registry.ts`、`content/pages/about.md`、`content/posts/markdown-showcase.md`

## 背景

`GithubRepo` 目前只有 `repo` / `description` / `language` / `stars` / `href` 五个 props，用户要求在卡片里补充 Fork 数、使用协议（许可证）等信息，并希望能选择是否用作者/组织头像替代 GitHub 图标。

## 选项

1. 构建期调用 GitHub REST API 抓取 `stargazers_count` / `forks_count` / `license` / `owner.avatar_url`，免手填但依赖网络与 60 次/小时匿名限额，预渲染失败会导致构建失败。
2. 继续使用静态 props，由作者手填数值，组件只负责展示与格式化。
3. 静态 props 与构建期抓取并存：props 优先，缺省时再请求 API。

## 决策

选择方案 2（与 [004](004-github-repo-mdc-card.md) 一致），新增静态 props：

- `forks?: string | number`：格式化规则与 `stars` 相同（数字走 `toLocaleString('en-US')`）。
- `license?: string`：显示为文字标签，例如 `MIT`、`CC BY-NC-SA 4.0`；建议同时支持 `license-href` 或直接复用 `href` 之外的链接字段（实现时可只显示文字，保持卡片只有一个外链）。
- `show-avatar?: boolean`，默认 `false`：为 `true` 时把左侧 GitHub 图标换成 `https://github.com/<owner>.png?size=80` 的作者/组织头像；`owner` 从 `repo` 的 `split('/')[0]` 取得。
- `avatar?: string`：可选覆盖头像地址（本地图或 GitHub Enterprise）。

图标建议：Fork 使用已注册的 `git-fork`，许可证使用已注册的 `license` 或新增 `scale`/`certificate`（当前 `icon-registry.ts` 没有 `license` 图标，若需要必须同时补导入与 `TABLER_COMPONENTS` 条目，见 [layout/006](../layout/006-icon-system.md)）。

## 后果

- 数值仍是静态的，Star/Fork 变化不会自动更新；README 和 [004](004-github-repo-mdc-card.md) 的说明需要同步。
- 头像走 GitHub 外链，离线构建不受影响，但内网预览时可能不显示；可用 `avatar` prop 覆盖成本地图。
- `show-avatar` 为 `true` 时卡片左侧不再是 `bg-app-text` 方块，需要保留固定尺寸（`size-8`、`rounded-lg`）避免标题错位。
- 许可证文字属于说明性信息，链接仍指向仓库；若未来需要指向许可证文件，建议再加 `license-href` 而不是把 `href` 挪走。
