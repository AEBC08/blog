<script setup lang="ts">
import { MiuixIconButton } from 'miuix-vue'

const { playing, load } = useMusicPlayer()
const open = ref(false)
const root = ref<HTMLElement | null>(null)

function toggle(): void {
  open.value = !open.value

  if (open.value) {
    void load()
  }
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
      aria-label="音乐播放器"
      aria-haspopup="dialog"
      :aria-expanded="open"
      class="!size-9 !rounded-full text-app-text-variant transition-colors hover:!bg-app-primary-soft hover:!text-app-primary-text"
      @click="toggle"
    >
      <span class="relative grid place-items-center">
        <Icon name="miuix:Music" :size="20" />
        <span
          v-if="playing"
          class="absolute -right-1 -top-0.5 size-1.5 rounded-full bg-app-primary-text"
          aria-hidden="true"
        />
      </span>
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
        role="dialog"
        aria-label="音乐播放器"
        class="absolute right-0 top-full z-50 mt-2 w-72 max-w-[calc(100vw-1.5rem)] origin-top-right rounded-2xl border border-app-divider bg-app-card shadow-[var(--app-shadow-hover)]"
      >
        <ClientOnly>
          <MusicCard variant="panel" />
          <template #fallback>
            <p class="p-4 text-[11px] text-app-text-faint">
              歌单加载中…
            </p>
          </template>
        </ClientOnly>
      </div>
    </Transition>
  </div>
</template>
