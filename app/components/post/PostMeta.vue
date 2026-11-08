<script setup lang="ts">
interface Props {
  published: string
  category?: string
  tags?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  category: undefined,
  tags: () => [],
})
</script>

<template>
  <div class="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-app-text-variant">
    <time :datetime="props.published" class="inline-flex items-center gap-1.5 text-app-text-faint">
      <Icon name="calendar" :size="16" />
      {{ formatDate(props.published) }}
    </time>

    <span v-if="props.category" class="h-3 w-px bg-app-divider" aria-hidden="true" />

    <NuxtLink
      v-if="props.category"
      :to="{ path: '/posts', query: { category: props.category } }"
      class="chip transition-opacity hover:opacity-80"
    >
      <Icon name="miuix:Folder" :size="14" />
      {{ props.category }}
    </NuxtLink>

    <NuxtLink
      v-for="tag in props.tags"
      :key="tag"
      :to="{ path: '/posts', query: { tag } }"
      class="inline-flex items-center gap-1 rounded-full border border-app-divider bg-app-bg-soft px-2.5 py-1 text-xs text-app-text-faint transition-colors hover:border-app-primary/40 hover:text-app-primary"
    >
      <Icon name="tag" :size="12" />
      {{ tag }}
    </NuxtLink>
  </div>
</template>
