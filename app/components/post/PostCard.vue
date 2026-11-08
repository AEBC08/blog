<script setup lang="ts">
import type { BlogListItem } from '~/composables/useBlogList'
import { MiuixCard } from 'miuix-vue'

interface Props {
  post: BlogListItem
  featured?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  featured: false,
})

const cover = resolveCoverImage(props.post.image)
</script>

<template>
  <NuxtLink :to="props.post.path" class="group block">
    <MiuixCard press-feedback="sink" show-indication class="app-card-hover h-full">
      <article :class="props.featured ? 'flex h-full flex-col' : 'flex h-full flex-col sm:flex-row'">
        <div
          v-if="cover"
          class="relative shrink-0 overflow-hidden"
          :class="props.featured
            ? 'aspect-[16/9] w-full sm:aspect-[21/9]'
            : 'aspect-[16/9] w-full sm:aspect-auto sm:w-56 lg:w-60'"
        >
          <img
            :src="cover"
            :alt="props.post.title"
            class="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.04]"
            :class="props.featured ? '' : 'sm:object-left'"
            loading="lazy"
          >
        </div>

        <div class="flex min-w-0 flex-1 flex-col p-5 sm:p-6">
          <div class="flex flex-wrap items-center gap-2 text-xs">
            <span v-if="props.post.category" class="chip">
              {{ props.post.category }}
            </span>
            <time :datetime="props.post.published" class="text-app-text-faint">{{ formatDate(props.post.published) }}</time>
            <span v-if="props.featured" class="ml-auto hidden text-[11px] font-medium text-app-text-faint sm:block">
              精选
            </span>
          </div>

          <h2
            class="font-bold text-app-text transition-colors group-hover:text-app-primary"
            :class="props.featured ? 'mt-3 text-2xl leading-tight sm:text-3xl' : 'mt-2.5 text-lg leading-snug'"
          >
            {{ props.post.title }}
          </h2>

          <p v-if="props.post.description" class="mt-2 line-clamp-2 text-sm leading-6 text-app-text-variant">
            {{ props.post.description }}
          </p>

          <div class="mt-auto flex items-end justify-between gap-3 pt-4">
            <div v-if="props.post.tags?.length" class="flex flex-wrap gap-1.5">
              <span
                v-for="tag in props.post.tags.slice(0, 4)"
                :key="tag"
                class="rounded-full bg-app-bg-soft px-2 py-0.5 text-[11px] text-app-text-faint"
              >
                #{{ tag }}
              </span>
            </div>
            <span class="ml-auto inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-app-primary-soft text-app-primary transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true">
              <Icon name="arrow-right" :size="16" />
            </span>
          </div>
        </div>
      </article>
    </MiuixCard>
  </NuxtLink>
</template>
