# 全站内容使用 CC BY-NC-SA 4.0 许可协议

- 日期：2026-11-08
- 状态：待实现（交接）
- 相关文件：`app/components/layout/FooterBar.vue`、`README.md`、`content/pages/about.md`、`package.json`

## 背景

用户要求「声明全站内容使用 CC BY-NC-SA 4.0 协议」。站点是个人博客，文章与图片属于作者内容，代码仓库本身则通常另有开源许可，两者需要区分。

## 选项

1. 只在页脚放一行协议文字，不写链接。
2. 页脚放协议声明 + 官方 deed 链接，并在 README、关于页、`package.json` 中同步声明。
3. 新增独立 `/license` 页面。

## 决策

选择方案 2（不新增页面，避免内容太少）：

- 页脚：`© {{ year }} {{ appConfig.site.author }}` 之后追加 `内容采用 CC BY-NC-SA 4.0 许可协议`，协议名链接到 `https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh-hans`。
- 关于页 `content/pages/about.md`：在「这个站点」段落补一句「本站文字与图片除特别注明外，均采用 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh-hans) 许可协议」。
- `README.md`：新增「许可」小节，说明内容协议与代码/依赖许可证的区别。
- `package.json`：`license` 字段设为 `CC-BY-NC-SA-4.0`（SPDX 标识符）。

## 后果

- CC BY-NC-SA 4.0 禁止商业使用，且衍生作品需同协议分享；若以后要允许转载商用，需要改协议并同步所有声明位置。
- 代码依赖（Nuxt、miuix-vue 等）仍是各自的上游许可证，`package.json` 的 `license` 只描述本仓库，不要据此推断依赖许可。
- 页脚文字长度增加，移动端应允许换行；协议链接同样需要 `target="_blank"` + `rel="noopener noreferrer"`。
- 需要在「已验证」清单里补一条：页脚协议链接与 `/deed.zh-hans` 文案可见，明暗主题下都正常。
