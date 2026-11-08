<script setup lang="ts">
interface Props {
  type?: 'info' | 'tip' | 'warning' | 'danger'
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  title: undefined,
})

const TYPES = {
  info: {
    container: 'border-l-sky-400 bg-sky-400/8',
    icon: 'bg-sky-400/15 text-sky-500',
    glyph: 'info-circle',
  },
  tip: {
    container: 'border-l-emerald-400 bg-emerald-400/8',
    icon: 'bg-emerald-400/15 text-emerald-500',
    glyph: 'circle-check',
  },
  warning: {
    container: 'border-l-amber-400 bg-amber-400/8',
    icon: 'bg-amber-400/15 text-amber-500',
    glyph: 'alert-triangle',
  },
  danger: {
    container: 'border-l-rose-400 bg-rose-400/8',
    icon: 'bg-rose-400/15 text-rose-500',
    glyph: 'circle-x',
  },
} as const

const style = computed(() => TYPES[props.type])
</script>

<template>
  <aside class="my-6 rounded-2xl border border-l-4 border-app-divider p-4 sm:p-5" :class="style.container">
    <div class="flex items-start gap-3">
      <span class="grid size-8 shrink-0 place-items-center rounded-xl" :class="style.icon">
        <Icon :name="style.glyph" :size="16" :stroke-width="2" />
      </span>

      <div class="min-w-0 flex-1">
        <p v-if="props.title" class="text-sm font-semibold text-app-text">
          {{ props.title }}
        </p>
        <div class="text-sm leading-7 text-app-text-variant" :class="props.title ? 'mt-1' : ''">
          <slot />
        </div>
      </div>
    </div>
  </aside>
</template>
