<script setup lang="ts">
import type { BlogListItem } from '~/composables/useBlogList'
import { MiuixCard } from 'miuix-vue'

interface Props {
  posts: BlogListItem[]
}

const props = defineProps<Props>()

// 卡片进场错峰封顶 360ms，长列表后半段不再叠加等待。
function stagger(index: number): { delay: number } {
  return {
    delay: Math.min(index * 60, 360),
  }
}
</script>

<template>
  <div v-if="props.posts.length" class="space-y-4">
    <div
      v-for="(post, index) in props.posts"
      :key="post.path"
      v-reveal="stagger(index)"
    >
      <PostCard :post="post" />
    </div>
  </div>

  <MiuixCard v-else>
    <div class="flex flex-col items-center justify-center px-6 py-14 text-center">
      <span class="grid size-12 place-items-center rounded-2xl bg-app-primary-soft text-app-primary-text">
        <svg class="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
          <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5v-13Z" />
          <path d="M8 9h8M8 13h5" />
        </svg>
      </span>
      <p class="mt-4 text-sm font-medium text-app-text">
        没有找到符合条件的文章
      </p>
      <p class="mt-1 text-xs text-app-text-faint">
        换一个关键词或分类试试。
      </p>
      <NuxtLink to="/posts" class="mt-4 rounded-full bg-app-primary px-4 py-2 text-xs font-semibold text-app-on-primary transition-opacity hover:opacity-90">
        查看全部文章
      </NuxtLink>
    </div>
  </MiuixCard>
</template>
