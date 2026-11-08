# Nitro 预渲染时的重复 Vue 运行时

- 日期：2026-11-07
- 状态：采纳
- 相关文件：`nuxt.config.ts`、`package.json`、`app/components/layout/TopBar.vue`、`app/components/layout/ThemeToggle.vue`

## 背景

`pnpm build` 在预渲染 `/` 时崩溃：

```text
Cannot read properties of null (reading 'ce')
    at renderSlot (.../prerender/chunks/_/nitro.mjs)
    at .../useBlogList-*.mjs (MiuixTopAppBar 的渲染函数)
```

同一个页面在 `pnpm dev` 与 Node 预览服务器下正常，只有预渲染阶段失败。问题只在渲染 miuix-vue 组件时出现，普通 Vue 组件（`MainGrid`、`PostCard` 等）不受影响。

## 根因

预渲染产物里同时存在两份 Vue 运行时：

1. Nitro 把 Vue 打包成 CJS（`vue.cjs.prod.js` → `@vue/runtime-core` 的 CJS 构建），SSR 渲染器与 Nuxt 自身用这一份。
2. `miuix-vue` 被 Nitro 当作 external 依赖，运行时从 `node_modules` 以 ESM 加载，并 `import ... from 'vue'`，拿到的是 Vue 的 ESM 入口（`index.mjs` → `@vue/runtime-dom` 的 ESM 构建）。

`renderSlot` 内部依赖当前渲染实例的 `currentRenderingInstance` 等模块级状态。两份 runtime-core 各有一份状态，miuix-vue 的 `renderSlot` 读到的实例为 `null`，于是在读取 `ce`（component emit）时抛错。

## 选项

1. 不用 miuix-vue，或把它换成 SSR 兼容性已知的组件库。
2. 只在客户端渲染 miuix-vue 组件（全部包 `<ClientOnly>`），牺牲首屏 SSR 内容。
3. 让 Nitro 侧的 Vue 只有一份：把 `vue`、`@vue/*` 与 `miuix-vue` 都内联进同一个 bundle，并用 alias 固定 Vue 入口为同一个物理文件。

## 决策

选择方案 3，在 `nuxt.config.ts` 中：

- 把 `vue` 加为直接依赖，使 `createRequire(import.meta.url).resolve('vue/dist/vue.cjs.prod.js')` 在项目根目录可解析。
- `nitro.alias` 将 `vue` 指向 `vue/dist/vue.cjs.prod.js`，将 `vue/server-renderer` 指向 `require.resolve('vue/server-renderer')`。
- `nitro.externals.inline` 包含：

```ts
[
  'vue',
  '@vue/server-renderer',
  '@vue/runtime-dom',
  '@vue/runtime-core',
  '@vue/reactivity',
  '@vue/shared',
  'miuix-vue',
  'motion-v',
]
```

这样 SSR 渲染器、Nuxt 应用代码与 miuix-vue 都引用同一个 `runtime-core.cjs.prod.js` 模块实例。

## 后果

- `pnpm build` 与 `--preset github_pages` 预渲染通过，miuix-vue 组件出现在静态 HTML 中。
- 服务端 bundle 变大（Vue 与 miuix-vue 被打包而不是 external），属于可接受的取舍。
- 升级 Nuxt/Nitro 或 miuix-vue 后，若预渲染再次出现 `renderSlot`/`currentRenderingInstance` 相关错误，应先检查是否又出现了第二份 Vue。
- `vue` 作为直接依赖必须与 Nuxt 实际使用的版本一致；`pnpm why vue` 目前只有 `3.5.45` 一个版本。
