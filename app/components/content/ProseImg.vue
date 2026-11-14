<script setup lang="ts">
/**
 * Markdown 正文的图片覆盖：统一懒加载 + 异步解码 + 加载完成淡入。
 * 其余属性（class、title 等）通过 attribute fallthrough 落到 img 上。
 */
defineProps<{
  src?: string
  alt?: string
  width?: number | string
  height?: number | string
}>()
</script>

<template>
  <img
    v-img-fade
    :src="src"
    :alt="alt ?? ''"
    :width="width"
    :height="height"
    loading="lazy"
    decoding="async"
  >
</template>
