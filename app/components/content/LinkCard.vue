<script setup lang="ts">
import { MIUIX_ICONS, TABLER_ICONS } from '~/utils/icon-registry'

interface Props {
  title: string
  href: string
  description?: string
  /** Either a registry icon name (`miuix:Folder`, `arrow-right`) or a letter. */
  icon?: string
  /** Any CSS colour; defaults to no background so the icon sits on the card. */
  iconBg?: string
  /** Any CSS colour; defaults to `--app-primary-text`. */
  iconColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  description: undefined,
  icon: undefined,
  iconBg: undefined,
  iconColor: undefined,
})

const hostname = computed(() => {
  try {
    return new URL(props.href).hostname
  }
  catch {
    return props.href
  }
})

const iconName = computed(() => {
  if (!props.icon) {
    return null
  }

  if (props.icon.startsWith('miuix:')) {
    return MIUIX_ICONS[props.icon.slice('miuix:'.length)]
      ? props.icon
      : null
  }

  return TABLER_ICONS[props.icon]
    ? props.icon
    : null
})

const initial = computed(() => props.icon ?? props.title.slice(0, 1).toUpperCase())

// Tailwind cannot enumerate arbitrary colour values at build time, so the
// configurable background and icon colour are applied as inline styles.
const iconStyle = computed(() => ({
  backgroundColor: props.iconBg ?? 'transparent',
  color: props.iconColor,
}))
</script>

<template>
  <ClientOnly>
    <a
      :href="props.href"
      target="_blank"
      rel="noopener noreferrer"
      class="group my-6 flex items-center gap-4 rounded-2xl border border-app-divider bg-app-card p-4 shadow-sm transition-colors hover:border-app-primary/40 hover:bg-app-bg-soft"
    >
      <span
        class="grid size-11 shrink-0 place-items-center rounded-xl text-base font-bold text-app-primary-text"
        :style="iconStyle"
      >
        <Icon v-if="iconName" :name="iconName" :size="22" />
        <template v-else>{{ initial }}</template>
      </span>
      <span class="min-w-0 flex-1">
        <span class="block truncate text-sm font-semibold text-app-text transition-colors group-hover:text-app-primary-text">{{ props.title }}</span>
        <span v-if="props.description" class="mt-0.5 block truncate text-xs text-app-text-variant">{{ props.description }}</span>
        <span class="mt-1 block truncate text-[11px] text-app-text-faint">{{ hostname }}</span>
      </span>
      <Icon name="arrow-up-right" class="shrink-0 text-app-text-faint transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-app-primary-text" :size="16" />
    </a>
  </ClientOnly>
</template>
