# Nuxt 4 目录结构与技术栈

- 日期：2026-11-07
- 状态：采纳
- 相关文件：`package.json`、`nuxt.config.ts`、`content.config.ts`、`tsconfig.json`

## 背景

project.md 要求 Nuxt 4 + Nuxt Content v3 + miuix-vue + Tailwind + TypeScript strict。实际安装到的最新版本与文档示例可能有差异，需要先锁定能协同工作的组合。

## 选项

1. Nuxt 3 风格的根目录 `components/`、`pages/`、`app.vue`。
2. Nuxt 4 默认的 `app/` 源码目录 + 根目录 `content/`、`public/`。

## 决策

选择方案 2，使用 Nuxt 4 默认结构：

- `app/app.vue`、`app/layouts/`、`app/pages/`、`app/components/`、`app/composables/`、`app/utils/`、`app/assets/css/`
- 根目录保留 `content/`、`public/`、`content.config.ts`、`nuxt.config.ts`、`scripts/`
- `components` 配置为 `{ path: '~/components', pathPrefix: false }`，得到 `TopBar`、`MainGrid`、`PostCard` 这类简洁组件名

实际安装版本：

- nuxt 4.6.4
- @nuxt/content 3.16.2
- miuix-vue 0.1.1（peer：motion-v ^2、vue ^3.4）
- motion-v 2.11.1
- @barzhsieh/nuxt-content-mermaid 4.0.1
- tailwindcss / @tailwindcss/vite 4.3.5
- typescript 5.9.3
- @antfu/eslint-config 10.0.0 + eslint 10.14.0
- pnpm 12.9.1，Node 24.21.0

## 后果

- Nuxt 4 自动把 `~`、`@` 指向 `app/`，不要假设它们指向仓库根目录。
- 生成类型后，`published` 在 `BlogCollectionItem` 中是 `string`（尽管 schema 写 `z.date()`），UI 用 `formatDate` 兼容。
- 后续新增脚本/配置时继续遵守 `kebab-case` 工具文件与 PascalCase 组件命名。
