<script setup lang="ts">
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
    <!-- 歌单在构建期写进 HTML，不需要客户端再取一次。 -->
    <MusicCard variant="sidebar" />
  </div>
  <div v-reveal="{ delay: 150 }">
    <CategoriesWidget :terms="categories" :active="activeCategory" />
  </div>
  <div v-reveal="{ delay: 200 }">
    <TagsWidget :terms="tags" :active="activeTag" />
  </div>
</template>
