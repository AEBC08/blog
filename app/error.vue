<script setup lang="ts">
import type { NuxtError } from '#app'
import { MiuixButton, MiuixCard } from 'miuix-vue'

interface Props {
  error: NuxtError
}

const props = defineProps<Props>()
const appConfig = useAppConfig()

const statusCode = computed(() => props.error?.statusCode ?? 404)
const isNotFound = computed(() => statusCode.value === 404)
const title = computed(() => isNotFound.value ? '页面走丢了' : '出了一点问题')
const description = computed(() => {
  if (isNotFound.value) {
    return '你访问的页面不存在，可能已经被移动或删除。'
  }

  return props.error?.message || '站点遇到了意外情况，请稍后再试。'
})

useSeoMeta({
  title: () => `${statusCode.value} · ${title.value}`,
  description: () => description.value,
  robots: 'noindex',
})

function goHome(): void {
  clearError({ redirect: '/' })
}
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <TopBar />

    <main class="flex flex-1 items-center justify-center px-4 py-16 sm:px-6">
      <MiuixCard class="relative w-full max-w-lg">
        <div class="p-8 text-center sm:p-10">
          <div class="relative">
            <p class="text-6xl font-extrabold leading-none text-app-primary sm:text-7xl">
              {{ statusCode }}
            </p>
            <h1 class="mt-4 text-2xl font-bold text-app-text">
              {{ title }}
            </h1>
            <p class="mx-auto mt-2 max-w-sm text-sm leading-7 text-app-text-variant">
              {{ description }}
            </p>

            <div class="mt-7 flex flex-wrap justify-center gap-3">
              <MiuixButton type="primary" class="!rounded-full !px-5 !text-sm" @click="goHome">
                回到首页
              </MiuixButton>
              <NuxtLink
                to="/posts"
                class="inline-flex items-center gap-2 rounded-full border border-app-divider bg-app-bg-soft px-5 py-2.5 text-sm font-semibold text-app-text-variant transition-colors hover:border-app-primary/40 hover:text-app-primary"
              >
                浏览文章
              </NuxtLink>
            </div>

            <p class="mt-8 text-xs text-app-text-faint">
              {{ appConfig.site.title }} · {{ appConfig.site.tagline }}
            </p>
          </div>
        </div>
      </MiuixCard>
    </main>

    <FooterBar />
  </div>
</template>
