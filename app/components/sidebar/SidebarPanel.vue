<script setup lang="ts">
const route = useRoute()

const isPostPage = computed(() => /^\/blog\/[^/]+/.test(route.path))
const activeCategory = computed(() => typeof route.query.category === 'string'
  ? route.query.category
  : undefined)
const activeTag = computed(() => typeof route.query.tag === 'string'
  ? route.query.tag
  : undefined)

const { categories, tags } = await useSidebarData()
</script>

<template>
  <ProfileWidget />
  <TocWidget v-if="isPostPage" />
  <CategoriesWidget :terms="categories" :active="activeCategory" />
  <TagsWidget :terms="tags" :active="activeTag" />
</template>
