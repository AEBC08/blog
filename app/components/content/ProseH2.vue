<script setup lang="ts">
interface Props {
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  id: undefined,
})
</script>

<template>
  <h2 :id="props.id" class="group">
    <a v-if="props.id" :href="`#${props.id}`" class="text-app-text! no-underline!">
      <slot />
      <Icon name="hash" class="ml-2 text-app-primary opacity-0 transition-opacity group-hover:opacity-100" :size="16" />
    </a>
    <slot v-else />
  </h2>
</template>
