<script setup lang="ts">
import { MiuixCard } from 'miuix-vue'

const appConfig = useAppConfig()
const { posts } = await useBlogList()
const { categories, tags } = await useSidebarData()

const latestPosts = computed(() => posts.value.slice(0, 5))
const featuredPost = computed(() => latestPosts.value[0] ?? null)
const restPosts = computed(() => latestPosts.value.slice(1))

useSeoMeta({
  title: '首页',
  description: appConfig.site.description,
})
</script>

<template>
  <MainGrid>
    <template #hero>
      <HeroBanner
        :post-count="posts.length"
        :category-count="categories.length"
        :tag-count="tags.length"
      />
    </template>

    <div class="space-y-6">
      <section v-reveal="{ delay: 80 }">
        <div class="mb-4 flex items-end justify-between gap-4">
          <div>
            <p class="text-xs font-medium text-app-primary-text">
              最新
            </p>
            <h2 class="mt-1 text-2xl font-bold text-app-text">
              最新文章
            </h2>
          </div>
          <NuxtLink
            to="/posts"
            class="group inline-flex items-center gap-1.5 rounded-full border border-app-divider bg-app-card px-4 py-2 text-sm font-semibold text-app-text-variant shadow-sm transition-colors hover:border-app-primary/40 hover:text-app-primary-text"
          >
            全部文章
            <Icon name="arrow-right" class="transition-transform group-hover:translate-x-0.5" :size="16" />
          </NuxtLink>
        </div>

        <div v-if="featuredPost" v-reveal class="mb-4">
          <PostCard :post="featuredPost" featured />
        </div>
        <PostList :posts="restPosts" />
      </section>

      <div v-reveal="{ delay: 140 }">
        <MiuixCard>
          <section class="p-5 sm:p-6">
            <div class="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p class="text-xs font-medium text-app-primary-text">
                  分类
                </p>
                <h2 class="mt-1 text-lg font-bold text-app-text">
                  按分类浏览
                </h2>
              </div>
              <NuxtLink to="/posts" class="text-sm font-medium text-app-primary-text hover:underline">
                查看全部
              </NuxtLink>
            </div>

            <div class="mt-4 flex flex-wrap gap-2">
              <NuxtLink
                v-for="category in categories"
                :key="category.name"
                :to="{ path: '/posts', query: { category: category.name } }"
                class="inline-flex items-center gap-2 rounded-full border border-app-divider bg-app-bg-soft px-3.5 py-2 text-sm font-medium text-app-text-variant transition-colors hover:border-app-primary/40 hover:text-app-primary-text"
              >
                <Icon name="miuix:Folder" :size="14" />
                {{ category.name }}
                <span class="rounded-full bg-app-primary-soft px-1.5 py-0.5 text-[10px] font-bold text-app-primary-text">{{ category.count }}</span>
              </NuxtLink>
            </div>
          </section>
        </MiuixCard>
      </div>
    </div>

    <template #sidebar>
      <SidebarPanel />
    </template>
  </MainGrid>
</template>
