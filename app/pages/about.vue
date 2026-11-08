<script setup lang="ts">
import { MiuixCard } from 'miuix-vue'

const appConfig = useAppConfig()
const avatar = resolveCoverImage(appConfig.profile.avatar)

const { data: page } = await useAsyncData('about-page', () => queryCollection('pages').path('/pages/about').first())

if (!page.value) {
  throw createError({ statusCode: 404, message: '页面不存在', fatal: true })
}

useSeoMeta({
  title: () => page.value?.title ?? '关于',
  description: () => page.value?.description,
  ogTitle: () => page.value?.title ?? '关于',
  ogDescription: () => page.value?.description,
})
</script>

<template>
  <div class="mx-auto w-full max-w-3xl px-4 sm:px-6">
    <MiuixCard v-if="page">
      <article>
        <header class="p-6 sm:p-10">
          <div class="flex items-center gap-4">
            <img
              v-if="avatar"
              :src="avatar"
              :alt="appConfig.profile.name"
              class="size-16 rounded-2xl border border-app-border object-cover"
              width="64"
              height="64"
            >
            <div>
              <p class="text-xs font-medium text-app-primary-text">
                About
              </p>
              <h1 class="mt-1 text-3xl font-bold leading-tight text-app-text sm:text-4xl">
                {{ page.title }}
              </h1>
            </div>
          </div>

          <p v-if="page.description" class="mt-4 max-w-2xl text-base leading-8 text-app-text-variant">
            {{ page.description }}
          </p>
        </header>

        <div class="border-t border-app-divider p-6 sm:p-10">
          <ContentRenderer :value="page" class="post-content" />
        </div>
      </article>
    </MiuixCard>
  </div>
</template>
