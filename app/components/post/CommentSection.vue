<script setup lang="ts">
/**
 * giscus 评论区（GitHub Discussions）。
 *
 * 懒挂载：滚动到评论区附近才注入 giscus 脚本；主题跟随站点明暗切换——
 * 监听 <html> 的 class 变化并通过 postMessage 通知 giscus iframe。
 * 配置来自 site.config.comments；四个 giscus 参数没有填全时不渲染，
 * 避免访客看到一个挂着的空壳。
 */
import { MiuixCard } from 'miuix-vue'

const appConfig = useAppConfig()

const ready = computed(() => {
  const g = appConfig.comments?.giscus

  return Boolean(
    appConfig.comments?.enabled
    && g?.repo
    && g?.repoId
    && g?.category
    && g?.categoryId,
  )
})

const container = ref<HTMLElement | null>(null)
const scriptMounted = ref(false)
let viewportObserver: IntersectionObserver | null = null
let themeObserver: MutationObserver | null = null

function currentTheme(): string {
  return document.documentElement.classList.contains('dark')
    ? 'dark'
    : 'light'
}

function pushTheme(): void {
  const iframe = container.value?.querySelector('iframe')

  iframe?.contentWindow?.postMessage(
    {
      giscus: [
        'setConfig',
        {
          theme: currentTheme(),
        },
      ],
    },
    'https://giscus.app',
  )
}

function mountWidget(): void {
  if (scriptMounted.value || !container.value) {
    return
  }

  const g = appConfig.comments?.giscus
  if (!g) {
    return
  }

  scriptMounted.value = true

  const script = document.createElement('script')
  script.src = 'https://giscus.app/client.js'
  script.async = true
  script.crossOrigin = 'anonymous'
  script.setAttribute('data-repo', g.repo)
  script.setAttribute('data-repo-id', g.repoId ?? '')
  script.setAttribute('data-category', g.category)
  script.setAttribute('data-category-id', g.categoryId ?? '')
  script.setAttribute('data-mapping', g.mapping || 'pathname')
  script.setAttribute('data-strict', '0')
  script.setAttribute('data-reactions-enabled', g.reactions === false
    ? '0'
    : '1')
  script.setAttribute('data-emit-metadata', '0')
  script.setAttribute('data-input-position', g.inputPosition === 'bottom'
    ? 'bottom'
    : 'top')
  script.setAttribute('data-theme', currentTheme())
  script.setAttribute('data-lang', 'zh-CN')
  script.setAttribute('data-loading', 'lazy')
  container.value.appendChild(script)

  // <html> 的 class 由 useTheme 三态切换驱动，系统模式同样会落到 class 上。
  themeObserver = new MutationObserver(pushTheme)
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  })
}

onMounted(() => {
  if (!ready.value) {
    return
  }

  viewportObserver = new IntersectionObserver(
    (entries) => {
      if (entries.some(entry => entry.isIntersecting)) {
        mountWidget()
        viewportObserver?.disconnect()
        viewportObserver = null
      }
    },
    { rootMargin: '240px 0px' },
  )

  if (container.value) {
    viewportObserver.observe(container.value)
  }
})

onBeforeUnmount(() => {
  viewportObserver?.disconnect()
  themeObserver?.disconnect()
})
</script>

<template>
  <MiuixCard v-if="ready">
    <section class="p-6 sm:p-10">
      <h2 class="flex items-center gap-2 text-lg font-bold text-app-text">
        <Icon name="message" class="text-app-primary-text" :size="18" />
        评论
      </h2>
      <p class="mt-1.5 text-xs text-app-text-faint">
        评论基于 GitHub Discussions，需要登录 GitHub 账号后发表。
      </p>
      <div ref="container" class="giscus mt-6 min-h-40" />
    </section>
  </MiuixCard>
</template>
