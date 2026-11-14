import { createRequire } from 'node:module'
import process from 'node:process'
import tailwindcss from '@tailwindcss/vite'
import { siteConfig } from './site.config'

const require = createRequire(import.meta.url)
// Nitro's prerenderer bundles Vue's CJS build. Point every `vue` import at the
// same physical file so component render functions and the SSR renderer share
// one runtime-core instance instead of two.
const VUE_CJS_ENTRY = require.resolve('vue/dist/vue.cjs.prod.js')

/**
 * Reads the persisted colour mode before first paint to avoid a flash of the
 * wrong theme. `theme-mode` is the current key; the legacy `theme` key keeps
 * returning visitors on the mode they chose before the three-way switch.
 * Kept inline and dependency-free so it can run in <head>.
 */
const THEME_INIT_SCRIPT = `(function(){var m="system";try{var s=localStorage.getItem("theme-mode");if(s==="system"||s==="light"||s==="dark"){m=s}else{var l=localStorage.getItem("theme");if(l==="light"||l==="dark"){m=l}}}catch(e){}var d=m==="dark"||(m==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);var c=document.documentElement.classList;c.toggle("dark",d);c.toggle("m-theme-dark",d);document.documentElement.setAttribute("data-theme-mode",m)})()`

/**
 * Mermaid theme layer. `themeCSS` is injected by Mermaid itself, so the
 * diagram keeps its generated shape geometry (`rx`/`ry` for rounded nodes,
 * none for square ones) while colours, text and edges read the site tokens.
 * `var(--app-*)` is resolved by the browser at paint time, which makes the
 * same generated theme work in both light and dark mode.
 */
const MERMAID_THEME_CSS = `
.node rect,
.node circle,
.node ellipse,
.node polygon,
.node path,
.node .label-container {
  fill: var(--app-card) !important;
  stroke: var(--app-border-strong) !important;
  stroke-width: 1px !important;
  filter: none !important;
}

.nodeLabel,
.nodeLabel p,
.node text,
.label,
.label text {
  color: var(--app-text) !important;
  fill: var(--app-text) !important;
  font-weight: 500 !important;
}

.edgePath .path,
.flowchart-link {
  stroke: var(--app-text-faint) !important;
  stroke-width: 1.2px !important;
}

.marker,
.arrowheadPath {
  fill: var(--app-text-faint) !important;
  stroke: var(--app-text-faint) !important;
}

.edgeLabel,
.edgeLabel p {
  background: var(--app-bg-soft) !important;
  color: var(--app-text-soft) !important;
}

.edgeLabel rect {
  fill: var(--app-bg-soft) !important;
  stroke: none !important;
}

.cluster rect {
  fill: var(--app-bg-soft) !important;
  stroke: var(--app-border) !important;
}

.cluster-label,
.cluster span {
  color: var(--app-text-soft) !important;
  fill: var(--app-text-soft) !important;
}

.actor {
  fill: var(--app-card) !important;
  stroke: var(--app-border-strong) !important;
}

text.actor > tspan {
  fill: var(--app-text) !important;
  stroke: none !important;
}

.actor-line,
.loopLine,
.relation,
.relationshipLine {
  stroke: var(--app-border-strong) !important;
}

.messageLine0,
.messageLine1 {
  stroke: var(--app-text-faint) !important;
}

.messageText,
.labelText,
.loopText,
.loopText > tspan {
  fill: var(--app-text) !important;
  stroke: none !important;
}

.labelBox {
  fill: var(--app-card) !important;
  stroke: var(--app-border-strong) !important;
}

.note {
  fill: var(--app-primary-soft) !important;
  stroke: var(--app-primary) !important;
}

.noteText,
.noteText > tspan {
  fill: var(--app-text) !important;
}

.classGroup rect,
.classGroup path,
.stateGroup rect,
.stateGroup circle,
.stateGroup path,
.entityBox {
  fill: var(--app-card) !important;
  stroke: var(--app-border-strong) !important;
}

.classLabel .box,
.attributeBoxOdd,
.attributeBoxEven {
  fill: var(--app-bg-soft) !important;
  stroke: var(--app-border) !important;
}

.classLabel .label,
.classTitle,
.classText,
.classGroup text,
.stateLabel,
.state-title,
.state-description,
.entityLabel {
  fill: var(--app-text) !important;
}

.task {
  fill: var(--app-primary-soft) !important;
  stroke: var(--app-primary) !important;
}

.taskText,
.taskTextOutsideRight,
.taskTextOutsideLeft,
.sectionTitle {
  fill: var(--app-text) !important;
}

.grid .tick {
  stroke: var(--app-border) !important;
}

.pieCircle {
  stroke: var(--app-border) !important;
}
`

export default defineNuxtConfig({
  compatibilityDate: '2026-11-07',
  devtools: { enabled: false },

  modules: [
    '@nuxt/content',
    '@barzhsieh/nuxt-content-mermaid',
  ],

  components: [
    { path: '~/components', pathPrefix: false },
  ],

  contentMermaid: {
    theme: {
      // `neutral` keeps the light diagrams close to the muted HyperOS palette.
      light: 'neutral',
      dark: 'dark',
    },
    loader: {
      init: {
        fontFamily: '"MiSans", "HarmonyOS Sans SC", "Noto Sans SC", system-ui, sans-serif',
        themeCSS: MERMAID_THEME_CSS,
        // Keep the intrinsic diagram width; the module wrapper scrolls
        // horizontally instead of shrinking wide LR charts into tiny labels.
        flowchart: {
          useMaxWidth: false,
          curve: 'linear',
          nodeSpacing: 40,
          rankSpacing: 50,
          padding: 12,
        },
        sequence: {
          useMaxWidth: false,
          actorMargin: 50,
          boxMargin: 10,
          mirrorActors: false,
        },
      },
    },
    toolbar: {
      title: '',
      labels: {
        copy: '复制',
        copied: '已复制',
        copyFailed: '复制失败',
        expand: '展开',
        collapse: '收起',
        minimize: '还原',
        enterFullscreen: '全屏',
        exitFullscreen: '退出全屏',
        zoomIn: '放大',
        zoomOut: '缩小',
        resetZoom: '重置缩放',
        download: '下载',
        downloadSvg: '下载 SVG',
        downloadPng: '下载 PNG',
      },
    },
  },

  css: [
    'katex/dist/katex.min.css',
    '@fontsource/maple-mono/latin-400.css',
    '@fontsource/maple-mono/latin-700.css',
    'miuix-vue/style.css',
    '~/assets/css/main.css',
  ],

  runtimeConfig: {
    // Server-only. Used by the GithubRepo card when prerendering; the workflow
    // passes the default Actions token so the API limit is 5000/h instead of 60.
    githubToken: process.env.GITHUB_TOKEN || '',
  },

  app: {
    // Route-level fade/slide transition; toggled from site.config.effects so
    // the build decides whether the transition classes ship at all.
    pageTransition: siteConfig.effects.pageTransition
      ? { name: 'page', mode: 'out-in' }
      : false,
    // Project sites live under https://<user>.github.io/<repository>/
    baseURL: process.env.NUXT_APP_BASE_URL || '/',
    // GitHub Pages ignores files starting with "_" (default: _nuxt)
    buildAssetsDir: 'nuxt_assets',
    head: {
      htmlAttrs: { lang: siteConfig.site.lang },
      title: siteConfig.site.title,
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: siteConfig.site.description },
        { name: 'theme-color', content: '#f2f3f5', media: '(prefers-color-scheme: light)' },
        { name: 'theme-color', content: '#121212', media: '(prefers-color-scheme: dark)' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://cdn-font.hyperos.mi.com', crossorigin: 'anonymous' },
        {
          rel: 'stylesheet',
          href: 'https://cdn-font.hyperos.mi.com/font/css?family=MiSans_VF:VF:Chinese_Simplify,Latin&display=swap',
        },
      ],
      script: [
        {
          key: 'theme-init',
          tagPriority: 'critical',
          innerHTML: THEME_INIT_SCRIPT,
        },
      ],
    },
  },

  content: {
    // Node 24 ships a stable node:sqlite binding; avoid the native
    // better-sqlite3 build step on CI runners and Windows.
    experimental: {
      sqliteConnector: 'native',
    },
    build: {
      markdown: {
        remarkPlugins: {
          'remark-math': {},
        },
        rehypePlugins: {
          'rehype-katex': { output: 'html' },
        },
        highlight: {
          theme: {
            default: 'github-light',
            dark: 'github-dark',
          },
          langs: [
            'ts',
            'js',
            'vue',
            'bash',
            'json',
            'jsonc',
            'css',
            'html',
            'md',
            'yaml',
          ],
        },
      },
    },
  },

  nitro: {
    alias: {
      'vue/server-renderer': require.resolve('vue/server-renderer'),
      'vue': VUE_CJS_ENTRY,
    },
    // miuix-vue is externalised by default, which makes it load its own copy of
    // Vue during prerendering. renderSlot then runs against a different runtime
    // instance and crashes (`Cannot read properties of null (reading 'ce')`).
    externals: {
      inline: [
        'vue',
        '@vue/server-renderer',
        '@vue/runtime-dom',
        '@vue/runtime-core',
        '@vue/reactivity',
        '@vue/shared',
        'miuix-vue',
        'motion-v',
      ],
    },
    prerender: {
      crawlLinks: true,
      routes: ['/', '/posts'],
      // Emit /posts/hello/index.html so both /posts/hello/ and GitHub Pages'
      // directory redirect for /posts/hello resolve on static hosting.
      autoSubfolderIndex: true,
    },
  },

  vite: {
    plugins: [
      tailwindcss(),
    ],
  },

  typescript: {
    tsConfig: {
      compilerOptions: {
        strict: true,
        noUncheckedIndexedAccess: true,
        noImplicitOverride: true,
        // miuix-vue@0.1.1 ships declarations under dist/src but its package.json
        // points at dist/index.d.ts. Map the public specifiers to real files.
        paths: {
          'miuix-vue': ['../node_modules/miuix-vue/dist/src/index.d.ts'],
          'miuix-vue/icons': ['../node_modules/miuix-vue/dist/src/icons/extended/index.d.ts'],
        },
      },
    },
  },
})
