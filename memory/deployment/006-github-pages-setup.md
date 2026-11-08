# 远程仓库 `AEBC08/blog` 与 GitHub Pages 上线

- 日期：2026-11-08
- 状态：采纳
- 相关文件：`.github/workflows/deploy.yml`、`nuxt.config.ts`（`app.baseURL` / `buildAssetsDir`）、`public/.nojekyll`

## 背景

项目此前只有本地仓库（`main` 停在 `df1aa3c`，无 remote），用户要求本轮收尾时直接建远程仓库、开 Pages 并推送。仓库名固定为 `blog`，因此部署前缀仍是 `/blog/`，与 [004](004-baseurl-blog-route-collision.md) 的 `/posts` 路由改造配套。

## 决策

1. 用本地 Git 里已保存的 GitHub 凭据（`git credential fill` 取到 40 位 PAT）调 REST API 建仓库：
   `POST /user/repos {name: "blog", private: false}`。
2. `git remote add origin https://github.com/AEBC08/blog.git`，`git push -u origin main`。
3. Pages 发布方式用 **GitHub Actions**，不用 `gh-pages` 分支：
   `POST /repos/AEBC08/blog/pages {"build_type": "workflow"}`。
4. 工作流沿用 `actions/configure-pages` + `upload-pages-artifact` + `deploy-pages`，构建时注入
   `NUXT_APP_BASE_URL=/blog/`（取自 `github.event.repository.name`）与 `GITHUB_TOKEN`（供仓库卡片读 API）。
5. 首次推送即触发工作流；构建失败的日志在 `gh run` / 仓库 Actions 页面可见。

## 后果

- 站点地址：<https://aebc08.github.io/blog/>。若日后换自定义域名，需要去掉 `NUXT_APP_BASE_URL` 并把 `baseURL` 设为 `/`。
- Pages 的 `build_type=workflow` 意味着**不要**再在仓库设置里切成「Deploy from a branch」，否则会覆盖发布源。
- 第一次部署如果早于 Pages 启用，`deploy` job 会报 `Get Pages site failed`；重新跑一次 workflow 即可。
- 构建期读 GitHub API 需要 `pages: write` 之外的 `contents: read` 就够，工作流没有额外加权限。
