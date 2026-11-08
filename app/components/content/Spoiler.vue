<script setup lang="ts">
interface Props {
  label?: string
  open?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  label: '展开内容',
  open: false,
})
</script>

<template>
  <details class="group my-6 overflow-hidden rounded-2xl border border-app-divider bg-app-card" :open="props.open">
    <summary class="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5 text-sm font-semibold text-app-text transition-colors hover:text-app-primary-text">
      <span class="flex items-center gap-2">
        <Icon name="bookmark" class="text-app-primary-text" :size="16" />
        {{ props.label }}
      </span>
      <Icon name="chevron-down" class="shrink-0 text-app-text-faint transition-transform duration-300 group-open:rotate-180" :size="16" />
    </summary>
    <div class="border-t border-app-divider px-4 py-4 text-sm leading-7 text-app-text-variant">
      <slot />
    </div>
  </details>
</template>
