<script setup lang="ts">
import type { MiuixIconWeight } from 'miuix-vue/icons'
import type { Component } from 'vue'
import { MiuixIcon } from 'miuix-vue'
import { FALLBACK_ICON, MIUIX_ICONS, TABLER_ICONS } from '~/utils/icon-registry'

interface Props {
  /** Tabler kebab-case name (`arrow-right`), `tabler:` prefixed, or `miuix:Folder`. */
  name: string
  /** Edge length in pixels. */
  size?: number
  /** Tabler stroke width. Ignored by miuix icons, which use `weight`. */
  strokeWidth?: number
  /** miuix icon weight. */
  weight?: MiuixIconWeight
  /** Tint colour. Defaults to the inherited text colour. */
  color?: string
  /** Accessible label. Omit for decorative icons. */
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 16,
  strokeWidth: 1.8,
  weight: 'regular',
  color: undefined,
  label: undefined,
})

const miuixIcon = computed(() => {
  if (!props.name.startsWith('miuix:')) {
    return null
  }

  return MIUIX_ICONS[props.name.slice('miuix:'.length)] ?? null
})

const tablerIcon = computed<Component | null>(() => {
  if (miuixIcon.value) {
    return null
  }

  const raw = props.name.startsWith('tabler:')
    ? props.name.slice('tabler:'.length)
    : props.name

  return TABLER_ICONS[raw] ?? FALLBACK_ICON
})

const a11y = computed(() => props.label
  ? { 'role': 'img', 'aria-label': props.label }
  : { 'aria-hidden': 'true' })
</script>

<template>
  <MiuixIcon
    v-if="miuixIcon"
    v-bind="a11y"
    class="app-icon"
    :icon="miuixIcon"
    :size="props.size"
    :weight="props.weight"
    :color="props.color"
  />
  <component
    :is="tablerIcon"
    v-else
    v-bind="a11y"
    class="app-icon"
    :size="props.size"
    :stroke-width="props.strokeWidth"
    :stroke="props.color"
  />
</template>
