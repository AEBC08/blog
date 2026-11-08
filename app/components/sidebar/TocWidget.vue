<script setup lang="ts">
import type { TocLink } from '@nuxt/content'
import { MiuixCard } from 'miuix-vue'

const { page } = await useBlogPost()
const links = computed<TocLink[]>(() => page.value?.body.toc?.links ?? [])

const activeId = ref('')
let observer: IntersectionObserver | null = null

onMounted(() => {
  const elements = links.value
    .map(link => document.getElementById(link.id))
    .filter((element): element is HTMLElement => element !== null)

  if (elements.length === 0) {
    return
  }

  activeId.value = links.value[0]?.id ?? ''

  observer = new IntersectionObserver((entries) => {
    const visible = entries
      .filter(entry => entry.isIntersecting)
      .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
    const first = visible[0]

    if (first) {
      activeId.value = first.target.id
    }
  }, {
    rootMargin: '-18% 0px -68% 0px',
    threshold: [0, 1],
  })

  elements.forEach(element => observer?.observe(element))
})

onBeforeUnmount(() => {
  observer?.disconnect()
  observer = null
})
</script>

<template>
  <MiuixCard v-if="links.length">
    <div class="p-5">
      <h2 class="widget-title flex items-center gap-2 text-sm font-bold text-app-text">
        <Icon name="miuix:ListView" class="text-app-primary" :size="16" />
        目录
      </h2>

      <nav class="mt-3 space-y-0.5">
        <a
          v-for="link in links"
          :key="link.id"
          :href="`#${link.id}`"
          class="group flex items-start gap-2 rounded-lg py-1.5 pr-2 text-sm leading-5 transition-colors"
          :class="activeId === link.id
            ? 'font-semibold text-app-primary'
            : 'text-app-text-variant hover:text-app-text'"
          :style="{ paddingLeft: `${Math.max(link.depth - 2, 0) * 0.75 + 0.5}rem` }"
        >
          <span
            class="mt-[0.45rem] inline-block size-1.5 shrink-0 rounded-full transition-colors"
            :class="activeId === link.id ? 'bg-app-primary' : 'bg-app-border-strong group-hover:bg-app-primary/60'"
          />
          <span>{{ link.text }}</span>
        </a>
      </nav>
    </div>
  </MiuixCard>
</template>
