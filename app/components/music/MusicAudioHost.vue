<script setup lang="ts">
const { source, setAudio, load, onTimeUpdate, onLoadedMetadata, onPlay, onPause, onEnded, onError } = useMusicPlayer()

const el = ref<HTMLAudioElement | null>(null)

onMounted(() => {
  setAudio(el.value)
  void load()
})

onBeforeUnmount(() => {
  setAudio(null)
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
