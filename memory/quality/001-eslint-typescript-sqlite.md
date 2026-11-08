# ESLint、TypeScript 与原生 SQLite

- 日期：2026-11-07
- 状态：采纳
- 相关文件：`eslint.config.mjs`、`tsconfig.json`、`nuxt.config.ts`、`pnpm-workspace.yaml`、`package.json`

## 背景

项目要求 `pnpm lint` 零错误零警告、`pnpm typecheck` 零错误、TypeScript strict、全项目无 `any`。另外 `@nuxt/content` v3 在 Node 24 下默认可能需要编译 `better-sqlite3`，在 Windows 与 CI 上容易失败。

## 选项

1. ESLint + Prettier 分开配置。
2. 使用 `@antfu/eslint-config` 一体化（含 stylistic、Vue、TypeScript）。
3. 只用 `vue-tsc` 做类型检查，不跑 ESLint。

## 决策

- 选择方案 2：`@antfu/eslint-config`，开启 `vue`、`typescript`，关闭与本项目无关的 markdown/yaml/toml，忽略生成目录与文档。
- 显式设置 `ts/no-explicit-any: error`，并禁止 `console.log`（脚本目录放行）。
- `tsconfig.json` 继承 `.nuxt/tsconfig.json`，额外开启 `strict`、`noUncheckedIndexedAccess`、`noImplicitOverride`。
- Content 使用原生连接器：

```ts
content: {
  experimental: { sqliteConnector: 'native' }
}
```

- pnpm 12 默认阻止依赖构建脚本，需在 `pnpm-workspace.yaml` 中 `allowBuilds: { esbuild: true }`，并执行 `pnpm rebuild esbuild`。

## 后果

- 不依赖 `better-sqlite3` 的 native 编译，CI 只需 Node 24。
- `@antfu/eslint-config` 会自动检测 Vue/TypeScript，规则较严格；若某条规则与 Nuxt 自动导入冲突，按文件覆盖而不是全局关闭。
- pnpm 的构建脚本白名单是安全默认值带来的额外步骤，新增带 postinstall 的依赖时需要再次批准。
