# Prose 组件覆盖路径

- 日期：2026-11-07
- 状态：采纳
- 相关文件：`app/components/content/ProseH2.vue`

## 背景

project.md 的目录建议把 Prose 覆盖放在 `components/prose/`，但 Nuxt Content v3 文档明确要求覆盖组件位于 `components/content/`，否则不会替换内置 `ProseH2`。

## 选项

1. 放 `app/components/prose/ProseH2.vue`，依靠普通全局组件优先级。
2. 放 `app/components/content/ProseH2.vue`，符合官方覆盖机制。

## 决策

选择方案 2。Nuxt Content 模块会把每个 layer 的 `srcDir/components/content` 以 `dirs.unshift({ pathPrefix: false })` 注册到最高优先级，官方文档也要求在该目录覆盖 Prose 组件。

`ProseH2` 的 props 与原组件一致：`{ id?: string }`。由于 `@nuxt/content` / `@nuxtjs/mdc` 没有导出命名的 `ProseH2Props` 类型，这里用本地 `interface Props` 精确镜像原 props 形状。

## 后果

- 这是对 project.md 文件组织建议的有意偏离，已在此记录。
- 其他 MDC 组件也统一放 `app/components/content/`。
- H2 自定义样式：保留 `id`、锚点 `#`、hover 显示；不允许锚点继承正文下划线。
