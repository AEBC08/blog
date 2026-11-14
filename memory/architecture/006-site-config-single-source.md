# 006 站点配置独立为 site.config.ts

## 背景

站点名称、描述、页脚文案、技术栈链接、GitHub 地址分散在三处：`app/app.config.ts`（站点信息）、`nuxt.config.ts` 的 `app.head`（title / description / lang 另写一份）、以及组件内部（`FooterBar.vue` 的 `TECH_LINKS` 与 `LICENSE_URL`、`TopBar.vue` 的 GitHub 链接、页脚「内容采用 / 许可协议」文案）。改一次站点名要动多个文件，且 `<head>` 与 `useAppConfig()` 可能不同步。

协作方提出「把站点名称、页脚之类的配置独立出来」。

## 选项

1. 继续扩充 `app/app.config.ts`，组件从 `useAppConfig()` 读；但 `nuxt.config.ts` 无法读取运行时 app config，`<head>` 仍需重复一份。
2. 抽到根目录 `site.config.ts`，由 `nuxt.config.ts`（构建期）与 `app/app.config.ts`（运行时）共同引用，组件仍统一走 `useAppConfig()`。
3. 组件直接 import 独立配置模块，绕过 `useAppConfig()`；改动面最大，且失去 Nuxt 的 HMR / 配置合并能力。

## 决策

选 2。新建根目录 `site.config.ts` 导出 `siteConfig`，分组为 `site` / `profile` / `navigation` / `header` / `footer` / `hero`。`app/app.config.ts` 收敛为 `defineAppConfig(siteConfig)`，`nuxt.config.ts` 的 `app.head` 读取 `siteConfig.site.*`。

组件侧把剩余硬编码清掉：`FooterBar.vue` 从 `footer` 读版权模板（`{year}` / `{author}` 占位）、许可声明、技术栈与附加链接、头像开关；`TopBar.vue` 的 GitHub 图标改为遍历 `header.socialLinks`；`app.vue` 的标题分隔符读 `site.titleSeparator`；`HeroBanner.vue` 的品牌小字留空时继承 `site.title`。两张 banner SVG 里写死的 `AEBC08` 文字与蓝条删除，改由组件按配置渲染。

`.nuxt/app.config.mjs` 是直接 `import` 源 `app/app.config.ts`，因此 app.config 内引用外部模块可行，`nuxt prepare` / `lint` / `typecheck` / `build` 均验证通过。

## 后果

- 站点名、版权、页脚链接只改一个文件；`<head>` 与运行时配置不会再漂移。
- `siteConfig` 的类型经 `defineAppConfig` 推断后进入 `useAppConfig()`，新增字段无需手写接口；`footer.extraLinks` 为空数组时用 `as SiteLink[]` 保留可填充类型。
- `hero` 配置一并在该文件维护（见 layout/010），`app/app.config.ts` 不再是配置文件，只是适配层。
- 内容文件 `content/pages/about.md` 里出现的站点名属于正文，仍需人工同步。
