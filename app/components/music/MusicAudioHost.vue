<script setup lang="ts">
const { source, setAudio, load, onTimeUpdate, onLoadedMetadata, onPlay, onPause, onEnded, onError } = useMusicPlayer()

const el = ref<HTMLAudioElement | null>(null)

/** Coming back from offline is the most common reason the first load failed. */
function onOnline(): void {
  void load()
}

onMounted(() => {
  setAudio(el.value)
  void load()
  window.addEventListener('online', onOnline)
})

onBeforeUnmount(() => {
  setAudio(null)
  window.removeEventListener('online', onOnline)
})
</script>

<template>
  <!-- One element for the whole site: it lives in the layout, so audio keeps
       playing while the route changes and both player surfaces share it. -->
  <audio
    ref="el"
    :src="source || undefined"
    preload="none"
    @timeupdate="onTimeUpdate"
    @loadedmetadata="onLoadedMetadata"
    @play="onPlay"
    @pause="onPause"
    @ended="onEnded"
    @error="onError"
  />
</template>
