<script setup lang="ts">
import type { SidebarTerm } from '~/composables/useSidebarData'
import { MiuixCard } from 'miuix-vue'

interface Props {
  terms: SidebarTerm[]
  active?: string
}

const props = withDefaults(defineProps<Props>(), {
  active: undefined,
})
</script>

<template>
  <MiuixCard v-if="props.terms.length">
    <div class="p-5">
      <div class="flex items-center justify-between">
        <h2 class="widget-title flex items-center gap-2 text-sm font-bold text-app-text">
          <Icon name="miuix:Folder" class="text-app-primary" :size="16" />
          分类
        </h2>
        <span class="text-xs font-medium text-app-text-faint">{{ props.terms.length }}</span>
      </div>

      <ul class="mt-3 space-y-0.5">
        <li v-for="term in props.terms" :key="term.name">
          <NuxtLink
            :to="{ path: '/posts', query: { category: term.name } }"
            class="flex items-center justify-between gap-2 rounded-xl px-2.5 py-2 text-sm transition-colors"
            :class="props.active === term.name
              ? 'bg-app-primary-soft font-semibold text-app-primary'
              : 'text-app-text-variant hover:bg-app-bg-soft hover:text-app-text'"
          >
            <span class="truncate">{{ term.name }}</span>
            <span
              class="shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
              :class="props.active === term.name ? 'bg-app-primary/15 text-app-primary' : 'bg-app-bg-soft text-app-text-faint'"
            >
              {{ term.count }}
            </span>
          </NuxtLink>
        </li>
      </ul>
    </div>
  </MiuixCard>
</template>
