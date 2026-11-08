<script setup lang="ts">
import { MiuixCard, MiuixSearchBar } from 'miuix-vue'

const appConfig = useAppConfig()
const route = useRoute()
const { posts } = await useBlogList()
const { categories } = await useSidebarData()

const search = ref('')

const activeCategory = computed(() => typeof route.query.category === 'string'
  ? route.query.category
  : undefined)
const activeTag = computed(() => typeof route.query.tag === 'string'
  ? route.query.tag
  : undefined)
const normalizedQuery = computed(() => search.value.trim().toLowerCase())

const filteredPosts = computed(() =>
  posts.value.filter((post) => {
    const matchesCategory = !activeCategory.value || post.category === activeCategory.value
    const matchesTag = !activeTag.value || (post.tags ?? []).includes(activeTag.value)
    const haystack = [
      post.title,
      post.description ?? '',
      post.category ?? '',
      ...(post.tags ?? []),
    ]
    const matchesSearch = !normalizedQuery.value
      || haystack.some(value => value.toLowerCase().includes(normalizedQuery.value))

    return matchesCategory && matchesTag && matchesSearch
  }),
)

const hasFilter = computed(() => Boolean(activeCategory.value || activeTag.value || normalizedQuery.value))

async function clearFilters(): Promise<void> {
  search.value = ''
  await navigateTo('/posts')
}

useSeoMeta({
  title: '文章',
  description: appConfig.site.description,
})
</script>

<template>
  <MainGrid>
    <div class="space-y-6">
      <MiuixCard>
        <header class="p-6 sm:p-8">
          <div class="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p class="text-xs font-medium text-app-primary">
                归档
              </p>
              <h1 class="mt-1 text-3xl font-bold text-app-text sm:text-4xl">
                文章
              </h1>
              <p class="mt-2 text-sm text-app-text-variant">
                共 {{ posts.length }} 篇已发布文章 · 按时间倒序
              </p>
            </div>

            <MiuixSearchBar
              v-model="search"
              label="搜索文章"
              class="blog-search w-full sm:!w-64"
            />
          </div>

          <div class="mt-5 flex flex-wrap gap-2">
            <NuxtLink
              to="/posts"
              class="inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors"
              :class="!activeCategory
                ? 'border-app-primary/30 bg-app-primary-soft text-app-primary'
                : 'border-app-divider bg-app-bg-soft text-app-text-variant hover:text-app-text'"
            >
              <Icon name="layout-grid" :size="13" />
              全部
            </NuxtLink>
            <NuxtLink
              v-for="category in categories"
              :key="category.name"
              :to="{ path: '/posts', query: { category: category.name } }"
              class="inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors"
              :class="activeCategory === category.name
                ? 'border-app-primary/30 bg-app-primary-soft text-app-primary'
                : 'border-app-divider bg-app-bg-soft text-app-text-variant hover:text-app-text'"
            >
              <Icon name="miuix:Folder" :size="13" />
              {{ category.name }}
              <span class="opacity-60">{{ category.count }}</span>
            </NuxtLink>
          </div>

          <div v-if="hasFilter" class="mt-4 flex flex-wrap items-center gap-2 text-xs">
            <span class="text-app-text-faint">当前筛选：</span>
            <span v-if="activeTag" class="chip">#{{ activeTag }}</span>
            <span v-if="normalizedQuery" class="chip">“{{ search }}”</span>
            <button
              type="button"
              class="inline-flex items-center gap-1 font-medium text-app-primary hover:underline"
              @click="clearFilters"
            >
              <Icon name="x" :size="12" />
              清除全部
            </button>
          </div>
        </header>
      </MiuixCard>

      <div class="flex items-center justify-between px-1">
        <p class="text-sm text-app-text-variant">
          共 <span class="font-semibold text-app-text">{{ filteredPosts.length }}</span> 篇
        </p>
        <p class="text-xs text-app-text-faint">
          {{ normalizedQuery ? '搜索结果' : '最近发布优先' }}
        </p>
      </div>

      <PostList :posts="filteredPosts" />
    </div>

    <template #sidebar>
      <SidebarPanel />
    </template>
  </MainGrid>
</template>
