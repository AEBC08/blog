import { siteConfig } from '../site.config'

/**
 * 站点信息统一维护在根目录 site.config.ts：这里只负责把它交给 Nuxt 的
 * useAppConfig()，nuxt.config.ts 也读取同一份配置生成 <head>。
 * 友链写在 content/pages/about.md 里，用 LinkCard 组成，见 memory/content/009。
 */
export default defineAppConfig(siteConfig)
