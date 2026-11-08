# 代码用 MIT，内容用 CC BY-NC-SA 4.0

- 日期：2026-11-08
- 状态：采纳（修订 [007](007-site-license-cc-by-nc-sa.md) 里「整仓库 CC」的做法）
- 相关文件：`LICENSE`、`package.json`、`README.md`、`content/pages/about.md`、`app/components/layout/FooterBar.vue`

## 背景

007 把 `package.json` 的 `license` 设为 `CC-BY-NC-SA-4.0`，等于声明「整个仓库都是 CC」。上线后用户要求：**仓库协议改成 MIT，CC 只覆盖文章**。这对博客很常见——代码希望别人能直接复用，文章则要保留署名与非商业限制。

## 选项

1. 全仓库 MIT，文章不再声明 CC。
2. **代码 MIT + 内容 CC BY-NC-SA 4.0，两处分别声明。**
3. 全仓库 CC，只改 README 措辞。

## 决策

选择方案 2：

- 新增根 `LICENSE`：标准 MIT 正文（Copyright 2026 AEBC08），末尾用一段中文说明「`content/` 与 `public/` 下的文章、图片不在 MIT 范围内，采用 CC BY-NC-SA 4.0」。
- `package.json` 的 `license` 改为 `MIT`（SPDX 标识），供 GitHub 仓库页识别。
- README「许可」小节拆成两条：**代码** MIT（链接 `LICENSE`）、**内容** CC BY-NC-SA 4.0（链接 deed），并注明依赖各自的上游许可证与本仓库无关。
- 关于页正文改为「文章与图片采用 CC BY-NC-SA 4.0；站点代码以 MIT 开源」，同时链接 `LICENSE`。
- 页脚那一行保持「内容采用 CC BY-NC-SA 4.0」——它描述的是内容，措辞本来就正确，不需要改。

## 后果

- GitHub 仓库页会显示 MIT；`GithubRepo` 卡片读 API 后也会显示 `MIT`，与关于页卡片一致。
- 边界靠文字约定而不是工具约束：`content/`、`public/` 归 CC，其余归 MIT。新增「创作内容」目录时要同步更新 `LICENSE` 末尾那段说明。
- 如果有人只想取用主题代码，MIT 已经足够宽松；若以后要允许商用转载文章，需要单独改 CC 声明的位置（页脚、关于页、README、LICENSE 尾注）。
