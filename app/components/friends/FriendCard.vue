<script setup lang="ts">
/**
 * 友链卡片：头像 + 名称 + 描述 + 域名。头像缺失或加载失败不特殊处理
 * （img 加载失败时隐藏，占位字母块仍在），数据来自 site.config.friends。
 */
interface Props {
  name: string
  href: string
  avatar?: string
  description?: string
}

const props = withDefaults(defineProps<Props>(), {
  avatar: undefined,
  description: undefined,
})

const resolvedAvatar = computed(() =>
  props.avatar
    ? resolveCoverImage(props.avatar)
    : undefined)

const hostname = computed(() => {
  try {
    return new URL(props.href).hostname
  }
  catch {
    return props.href
  }
})

// 头像加载失败时切回首字母占位。
const avatarFailed = ref(false)
const showAvatar = computed(() => Boolean(resolvedAvatar.value) && !avatarFailed.value)
const initial = computed(() => props.name.slice(0, 1).toUpperCase())
</script>

<template>
  <a
    :href="props.href"
    target="_blank"
    rel="noopener noreferrer"
    class="group flex items-center gap-3 rounded-2xl border border-app-divider bg-app-card p-3.5 shadow-sm transition-colors hover:border-app-primary/40 hover:bg-app-bg-soft"
  >
    <img
      v-if="showAvatar && resolvedAvatar"
      v-img-fade
      :src="resolvedAvatar"
      :alt="props.name"
      class="size-10 shrink-0 rounded-xl border border-app-border object-cover"
      width="40"
      height="40"
      loading="lazy"
      decoding="async"
      @error="avatarFailed = true"
    >
    <span
      v-else
      class="grid size-10 shrink-0 place-items-center rounded-xl bg-app-primary-soft text-base font-bold text-app-primary-text"
    >
      {{ initial }}
    </span>

    <span class="min-w-0 flex-1">
      <span class="block truncate text-sm font-semibold text-app-text transition-colors group-hover:text-app-primary-text">{{ props.name }}</span>
      <span v-if="props.description" class="mt-0.5 line-clamp-2 block text-xs leading-5 text-app-text-variant">{{ props.description }}</span>
      <span class="mt-1 block truncate text-[11px] text-app-text-faint">{{ hostname }}</span>
    </span>

    <Icon
      name="arrow-up-right"
      class="shrink-0 text-app-text-faint transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-app-primary-text"
      :size="16"
    />
  </a>
</template>
