# Git Bash 里构建子路径站点：`/blog/` 被 MSYS 改写成 Windows 路径

- 日期：2026-11-08
- 状态：采纳
- 相关文件：`nuxt.config.ts`（`app.baseURL`）、`README.md` 的「检查与构建」

## 背景

按 README 在 PowerShell 里用 `$env:NUXT_APP_BASE_URL='/blog/'` 构建一直没问题。这次在 Git Bash 里直接
`NUXT_APP_BASE_URL=/blog/ pnpm exec nuxt build --preset github_pages`，预渲染阶段全量 404：

```
[nitro] [404] Cannot find any path matching /D:/WorkBuddy/resources/vendor/PortableGit/blog/posts
```

## 选项

1. 换回 PowerShell 构建。
2. 给命令加引号（`NUXT_APP_BASE_URL='/blog/'`）——**无效**。
3. **`MSYS_NO_PATHCONV=1` 关闭 MSYS 路径转换。**

## 决策

选择方案 3：

```bash
MSYS_NO_PATHCONV=1 NUXT_APP_BASE_URL=/blog/ pnpm exec nuxt build --preset github_pages
```

## 后果

- 症状很迷惑：日志里出现的是「根目录 + 仓库路径」拼起来的假路径，容易被误判成 content 路径或 prerender 配置问题。
- 只要在 Git Bash / MSYS 环境里给 Nuxt 传 `/xxx/` 形式的环境变量，都可能被改写，不只是 baseURL。
- 如果坚持在 PowerShell 构建，则不需要这个开关；README 里的 PowerShell 示例继续有效。
