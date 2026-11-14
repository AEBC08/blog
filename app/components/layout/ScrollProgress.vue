<script setup lang="ts">
/**
 * 视口顶部的阅读进度条。用 transform: scaleX 驱动，滚动时只在合成层
 * 改动一个属性；进度为 0 时整条隐藏，避免和圆角顶栏抢视线。
 * 配置开关在 site.config.effects.scrollProgress。
 */
const appConfig = useAppConfig()

const progress = ref(0)
let frame = 0

function update(): void {
  frame = 0
  const doc = document.documentElement
  const max = doc.scrollHeight - window.innerHeight
  progress.value = max > 0
    ? Math.min(1, window.scrollY / max)
    : 0
}

function onScroll(): void {
  if (frame !== 0) {
    return
  }

  frame = window.requestAnimationFrame(update)
}

// Route changes (and the accompanying scroll reset) need one extra tick
// before scrollHeight reflects the new page.
const route = useRoute()
watch(
  () => route.path,
  () => {
    nextTick(update)
  },
)

onMounted(() => {
  update()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onScroll)

  if (frame !== 0) {
    window.cancelAnimationFrame(frame)
  }
})
</script>

<template>
  <div
    v-if="appConfig.effects.scrollProgress"
    class="scroll-progress pointer-events-none fixed inset-x-0 top-0 z-[70] h-0.5"
    :class="{ 'scroll-progress-active': progress > 0.004 }"
    aria-hidden="true"
  >
    <div
      class="scroll-progress-bar h-full origin-left"
      :style="{ transform: `scaleX(${progress})` }"
    />
  </div>
</template>

<style scoped>
.scroll-progress {
  opacity: 0;
  transition: opacity 0.25s ease;
}

.scroll-progress-active {
  opacity: 1;
}

.scroll-progress-bar {
  background: linear-gradient(
    90deg,
    var(--app-primary),
    var(--app-primary-text)
  );
  will-change: transform;
}
</style>
