<script setup lang="ts">
import { MiuixCard } from 'miuix-vue'

const route = useRoute()
const { page } = await useBlogPost()
const { posts } = await useBlogList()

if (!page.value) {
  throw createError({ statusCode: 404, message: '文章不存在', fatal: true })
}

const cover = resolveCoverImage(page.value?.image)

const currentIndex = computed(() =>
  posts.value.findIndex(post => normalizeContentPath(post.path) === normalizeContentPath(route.path)),
)
const newerPost = computed(() =>
  currentIndex.value > 0
    ? posts.value[currentIndex.value - 1]
    : undefined,
)
const olderPost = computed(() =>
  currentIndex.value >= 0
    ? posts.value[currentIndex.value + 1]
    : undefined,
)

useSeoMeta({
  title: () => page.value?.title,
  description: () => page.value?.description,
  ogTitle: () => page.value?.title,
  ogDescription: () => page.value?.description,
  ogImage: cover,
  ogType: 'article',
})
</script>

<template>
  <MainGrid>
    <div v-if="page" class="space-y-5">
      <NuxtLink
        to="/blog"
        class="group inline-flex items-center gap-2 rounded-full border border-app-divider bg-app-card px-4 py-2 text-sm font-medium text-app-text-variant shadow-sm transition-colors hover:border-app-primary/40 hover:text-app-primary"
      >
        <Icon name="arrow-left" class="transition-transform group-hover:-translate-x-0.5" :size="16" />
        返回文章列表
      </NuxtLink>

      <MiuixCard>
        <article>
          <div v-if="cover" class="relative">
            <img
              :src="cover"
              :alt="page.title"
              class="aspect-[16/9] w-full object-cover sm:aspect-[21/9]"
              width="1200"
              height="515"
            >
            <div class="absolute inset-0 bg-black/10" />
            <span
              v-if="page.category"
              class="absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/70 px-3 py-1 text-xs font-semibold text-white"
            >
              <Icon name="tag" :size="12" />
              {{ page.category }}
            </span>
          </div>

          <header class="p-6 sm:p-10">
            <p class="text-xs font-medium text-app-primary">
              文章
            </p>
            <h1 class="mt-2 text-3xl font-bold leading-[1.15] text-app-text sm:text-5xl">
              {{ page.title }}
            </h1>
            <p v-if="page.description" class="mt-4 max-w-3xl text-base leading-8 text-app-text-variant sm:text-lg">
              {{ page.description }}
            </p>
            <div class="mt-5">
              <PostMeta :published="page.published" :category="page.category" :tags="page.tags" />
            </div>
          </header>

          <div class="border-t border-app-divider p-6 sm:p-10">
            <ClientOnly v-if="page.layout === 'interactive'">
              <InteractivePost :page="page" />
              <!-- Static HTML still ships the Markdown body before the widget hydrates. -->
              <template #fallback>
                <ContentRenderer :value="page" class="post-content" />
              </template>
            </ClientOnly>

            <ContentRenderer v-else :value="page" class="post-content" />

            <footer class="mt-12 flex flex-col items-center gap-3 border-t border-app-divider pt-8 text-center">
              <p class="text-xs font-medium text-app-text-faint">
                文章结束
              </p>
              <NuxtLink
                to="/blog"
                class="mt-1 inline-flex items-center gap-2 rounded-full bg-app-primary-soft px-4 py-2 text-xs font-semibold text-app-primary transition-colors hover:bg-app-primary hover:text-app-on-primary"
              >
                <Icon name="arrow-left" :size="14" />
                继续浏览文章
              </NuxtLink>
            </footer>
          </div>
        </article>
      </MiuixCard>

      <nav v-if="newerPost || olderPost" class="grid gap-3 sm:grid-cols-2" aria-label="文章导航">
        <NuxtLink
          v-if="newerPost"
          :to="newerPost.path"
          class="group block"
        >
          <MiuixCard press-feedback="sink" show-indication>
            <div class="flex items-center gap-3 p-4">
              <span class="grid size-8 shrink-0 place-items-center rounded-full bg-app-primary-soft text-app-primary transition-transform group-hover:-translate-x-0.5" aria-hidden="true">
                <Icon name="arrow-left" :size="16" />
              </span>
              <span class="min-w-0">
                <span class="block text-[11px] font-medium tracking-[0.08em] text-app-text-faint">较新一篇</span>
                <span class="mt-0.5 block truncate text-sm font-semibold text-app-text transition-colors group-hover:text-app-primary">
                  {{ newerPost.title }}
                </span>
              </span>
            </div>
          </MiuixCard>
        </NuxtLink>

        <NuxtLink
          v-if="olderPost"
          :to="olderPost.path"
          class="group block"
        >
          <MiuixCard press-feedback="sink" show-indication>
            <div class="flex items-center gap-3 p-4 sm:flex-row-reverse sm:text-right">
              <span class="grid size-8 shrink-0 place-items-center rounded-full bg-app-primary-soft text-app-primary transition-transform group-hover:translate-x-0.5" aria-hidden="true">
                <Icon name="arrow-right" :size="16" />
              </span>
              <span class="min-w-0">
                <span class="block text-[11px] font-medium tracking-[0.08em] text-app-text-faint">较早一篇</span>
                <span class="mt-0.5 block truncate text-sm font-semibold text-app-text transition-colors group-hover:text-app-primary">
                  {{ olderPost.title }}
                </span>
              </span>
            </div>
          </MiuixCard>
        </NuxtLink>
      </nav>
    </div>

    <template #sidebar>
      <SidebarPanel />
    </template>
  </MainGrid>
</template>
