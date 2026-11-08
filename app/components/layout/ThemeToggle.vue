<script setup lang="ts">
import type { ThemeMode } from '~/composables/useTheme'
import { MiuixIconButton } from 'miuix-vue'

interface ThemeOption {
  value: ThemeMode
  label: string
  icon: string
}

const OPTIONS: ThemeOption[] = [
  { value: 'system', label: '系统', icon: 'device-desktop' },
  { value: 'light', label: '浅色', icon: 'sun' },
  { value: 'dark', label: '深色', icon: 'moon' },
]

const { mode, setMode } = useTheme()
const open = ref(false)
const root = ref<HTMLElement | null>(null)

function choose(next: ThemeMode): void {
  setMode(next)
  open.value = false
}

function onPointerDown(event: PointerEvent): void {
  const target = event.target

  if (target instanceof Node && root.value?.contains(target)) {
    return
  }

  open.value = false
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    open.value = false
  }
}

onMounted(() => {
  document.addEventListener('pointerdown', onPointerDown)
  document.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onPointerDown)
  document.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <div ref="root" class="relative">
    <MiuixIconButton
      aria-label="选择主题"
      aria-haspopup="menu"
      :aria-expanded="open"
      class="!size-9 !rounded-full text-app-text-variant transition-colors hover:!bg-app-primary-soft hover:!text-app-primary"
      @click="open = !open"
    >
      <!-- The trigger icon follows html[data-theme-mode], so it is correct
           before hydration and never flashes the wrong glyph. -->
      <Icon name="device-desktop" class="theme-mode-icon theme-mode-icon--system" :size="20" />
      <Icon name="sun" class="theme-mode-icon theme-mode-icon--light" :size="20" />
      <Icon name="moon" class="theme-mode-icon theme-mode-icon--dark" :size="20" />
    </MiuixIconButton>

    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="translate-y-1 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-1 opacity-0"
    >
      <div
        v-if="open"
        role="menu"
        aria-label="主题"
        class="absolute right-0 top-full z-50 mt-2 w-36 origin-top-right rounded-2xl border border-app-divider bg-app-card p-1.5 shadow-[var(--app-shadow-hover)]"
      >
        <button
          v-for="option in OPTIONS"
          :key="option.value"
          type="button"
          role="menuitemradio"
          :aria-checked="mode === option.value"
          class="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-[13px] font-medium transition-colors"
          :class="mode === option.value
            ? 'bg-app-primary-soft text-app-primary'
            : 'text-app-text-variant hover:bg-app-bg-soft hover:text-app-text'"
          @click="choose(option.value)"
        >
          <Icon :name="option.icon" :size="16" />

          <span>{{ option.label }}</span>

          <Icon v-if="mode === option.value" name="check" class="ml-auto" :size="16" :stroke-width="2" />
        </button>
      </div>
    </Transition>
  </div>
</template>
