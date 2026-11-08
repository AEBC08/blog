<script setup lang="ts">
interface Props {
  /** Repository in `owner/name` form, e.g. `AEBC08/blog`. */
  repo: string
  description?: string
  language?: string
  stars?: string | number
  /** Override the generated `https://github.com/<repo>` link. */
  href?: string
}

const props = withDefaults(defineProps<Props>(), {
  description: undefined,
  language: undefined,
  stars: undefined,
  href: undefined,
})

const link = computed(() => props.href ?? `https://github.com/${props.repo}`)
const starLabel = computed(() => {
  if (props.stars === undefined) {
    return null
  }

  return typeof props.stars === 'number'
    ? props.stars.toLocaleString('en-US')
    : props.stars
})
</script>

<template>
  <a
    :href="link"
    target="_blank"
    rel="noopener noreferrer"
    class="group my-6 block overflow-hidden rounded-2xl border border-app-divider bg-app-card transition-colors hover:border-app-primary/40"
  >
    <div class="flex items-center gap-3 border-b border-app-divider bg-app-bg-soft px-4 py-3">
      <span class="grid size-8 shrink-0 place-items-center rounded-lg bg-app-text text-app-card">
        <Icon name="brand-github" :size="18" />
      </span>
      <span class="min-w-0 flex-1">
        <span class="block truncate text-sm font-semibold text-app-text transition-colors group-hover:text-app-primary-text">
          {{ props.repo }}
        </span>
        <span class="block truncate text-[11px] text-app-text-faint">
          GitHub 仓库
        </span>
      </span>
      <Icon
        name="arrow-up-right"
        class="shrink-0 text-app-text-faint transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-app-primary-text"
        :size="16"
      />
    </div>

    <div class="px-4 py-3">
      <p v-if="props.description" class="text-sm leading-6 text-app-text-variant">
        {{ props.description }}
      </p>

      <div class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-app-text-faint">
        <span v-if="props.language" class="inline-flex items-center gap-1.5">
          <span class="size-2 rounded-full bg-app-primary" aria-hidden="true" />
          {{ props.language }}
        </span>

        <span v-if="starLabel" class="inline-flex items-center gap-1">
          <Icon name="star" :size="12" />
          {{ starLabel }}
        </span>

        <span class="ml-auto inline-flex items-center gap-1">
          <Icon name="brand-github" :size="12" />
          查看仓库
        </span>
      </div>
    </div>
  </a>
</template>
