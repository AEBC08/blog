<script setup lang="ts">
import { MiuixIconButton } from 'miuix-vue'

const visible = ref(false)
let frame = 0

function update(): void {
  frame = 0
  visible.value = window.scrollY > 480
}

function onScroll(): void {
  if (frame !== 0) {
    return
  }

  frame = window.requestAnimationFrame(update)
}

function toTop(): void {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  update()
  window.addEventListener('scroll', onScroll, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)

  if (frame !== 0) {
    window.cancelAnimationFrame(frame)
  }
})
</script>

<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="translate-y-2 opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="translate-y-2 opacity-0"
  >
    <div v-if="visible" class="fixed right-4 bottom-5 z-40 sm:right-6 sm:bottom-7">
      <div class="app-card rounded-full p-0.5">
        <MiuixIconButton
          aria-label="回到顶部"
          class="!size-11 !rounded-full text-app-text-variant hover:!text-app-primary-text"
          @click="toTop"
        >
          <Icon name="arrow-up" :size="20" />
        </MiuixIconButton>
      </div>
    </div>
  </Transition>
</template>
