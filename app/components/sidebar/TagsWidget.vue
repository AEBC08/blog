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
          <Icon name="tag" class="text-app-primary-text" :size="16" />
          标签
        </h2>
        <span class="text-xs font-medium text-app-text-faint">{{ props.terms.length }}</span>
      </div>

      <div class="mt-3 flex flex-wrap gap-1.5">
        <NuxtLink
          v-for="term in props.terms"
          :key="term.name"
          :to="{ path: '/posts', query: { tag: term.name } }"
          class="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-colors"
          :class="props.active === term.name
            ? 'border-app-primary/30 bg-app-primary text-app-on-primary'
            : 'border-app-divider bg-app-bg-soft text-app-text-variant hover:border-app-primary/40 hover:text-app-primary-text'"
        >
          #{{ term.name }}
          <span class="opacity-60">{{ term.count }}</span>
        </NuxtLink>
      </div>
    </div>
  </MiuixCard>
</template>
