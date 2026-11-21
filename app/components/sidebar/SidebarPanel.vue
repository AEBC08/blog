<script setup lang="ts">
import { MiuixCard } from 'miuix-vue'

const route = useRoute()

const isPostPage = computed(() => /^\/posts\/[^/]+/.test(route.path))
const activeCategory = computed(() => typeof route.query.category === 'string'
  ? route.query.category
  : undefined)
const activeTag = computed(() => typeof route.query.tag === 'string'
  ? route.query.tag
  : undefined)

const { categories, tags } = await useSidebarData()
</script>

<template>
  <div v-reveal>
    <ProfileWidget />
  </div>
  <div v-if="isPostPage" v-reveal="{ delay: 50 }">
    <TocWidget />
  </div>
  <div v-reveal="{ delay: 100 }">
    <!-- 播放器只认客户端数据：歌单更新走定时同步，不需要重新构建站点。 -->
    <ClientOnly>
      <MusicCard variant="sidebar" />
      <template #fallback>
        <MiuixCard>
          <div class="p-4">
            <h2 class="widget-title flex items-center gap-2 text-sm font-bold text-app-text">
              <Icon name="miuix:Music" class="text-app-primary-text" :size="16" />
              音乐
            </h2>
            <p class="mt-3 text-[11px] leading-5 text-app-text-faint">
              歌单加载中…
            </p>
          </div>
        </MiuixCard>
      </template>
    </ClientOnly>
  </div>
  <div v-reveal="{ delay: 150 }">
    <CategoriesWidget :terms="categories" :active="activeCategory" />
  </div>
  <div v-reveal="{ delay: 200 }">
    <TagsWidget :terms="tags" :active="activeTag" />
  </div>
</template>
