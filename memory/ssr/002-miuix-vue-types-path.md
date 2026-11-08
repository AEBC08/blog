# miuix-vue 类型声明路径修复

- 日期：2026-11-07
- 状态：采纳
- 相关文件：`nuxt.config.ts`、`app/components/**/*.vue`

## 背景

安装 `miuix-vue@0.1.1` 后，`pnpm typecheck` 无法找到模块声明。检查发现包内声明实际位于 `dist/src/`，但 `package.json` 的 `types` 指向不存在的 `dist/index.d.ts`。

## 选项

1. 降级或升级 miuix-vue 到声明路径正确的版本。
2. 在项目里写 `declare module 'miuix-vue'` 兜底，但会丢失组件 props 类型。
3. 用 TypeScript `paths` 把公开 specifier 映射到真实声明文件。

## 决策

选择方案 3，在 `nuxt.config.ts` 的 `typescript.tsConfig.compilerOptions.paths` 中映射：

```json
{
  "miuix-vue": ["../node_modules/miuix-vue/dist/src/index.d.ts"],
  "miuix-vue/icons": ["../node_modules/miuix-vue/dist/src/icons/extended/index.d.ts"]
}
```

路径值相对于 Nuxt 生成的 `.nuxt/` 目录，因此必须写 `../node_modules/...`，写成 `./node_modules/...` 会解析到 `.nuxt/node_modules` 并继续报错。

## 后果

- 保留完整的组件 props/emits 类型，`noImplicitAny` 下可用。
- 升级 miuix-vue 后若声明路径修复，应删除这两条映射，避免指向不存在的文件。
- 该修复只影响类型检查，不影响 Vite 运行时解析。
