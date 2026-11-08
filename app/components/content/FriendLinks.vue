<script setup lang="ts">
const appConfig = useAppConfig()

const github = computed(() =>
  appConfig.profile.links.find(link => link.label === 'GitHub')?.href
  ?? 'https://github.com/AEBC08',
)
</script>

<template>
  <section class="mt-10 border-t border-app-divider pt-8">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <p class="text-xs font-medium text-app-primary">
          Links
        </p>
        <h2 class="mt-1 text-xl font-bold text-app-text">
          友链
        </h2>
      </div>

      <a
        :href="github"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-1.5 rounded-full border border-app-divider bg-app-bg-soft px-3 py-1.5 text-xs font-medium text-app-text-variant transition-colors hover:border-app-primary/40 hover:text-app-primary"
      >
        <Icon name="arrow-up-right" :size="14" />
        交换友链
      </a>
    </div>

    <div v-if="appConfig.friends.length" class="mt-4 grid gap-3 sm:grid-cols-2">
      <a
        v-for="friend in appConfig.friends"
        :key="friend.href"
        :href="friend.href"
        target="_blank"
        rel="noopener noreferrer"
        class="group flex items-start gap-3 rounded-2xl border border-app-divider bg-app-bg-soft p-4 transition-colors hover:border-app-primary/40"
      >
        <span class="grid size-9 shrink-0 place-items-center rounded-xl bg-app-primary-soft text-app-primary">
          <Icon :name="friend.icon ?? 'world'" :size="16" />
        </span>
        <span class="min-w-0">
          <span class="block truncate text-sm font-semibold text-app-text transition-colors group-hover:text-app-primary">
            {{ friend.name }}
          </span>
          <span class="mt-0.5 block text-xs leading-5 text-app-text-variant">
            {{ friend.description }}
          </span>
        </span>
        <Icon name="arrow-up-right" class="ml-auto shrink-0 text-app-text-faint" :size="14" />
      </a>
    </div>

    <p
      v-else
      class="mt-4 rounded-2xl border border-dashed border-app-divider bg-app-bg-soft p-5 text-sm leading-6 text-app-text-variant"
    >
      友链还在整理中。如果你想交换链接，可以在 GitHub 找到我。
    </p>
  </section>
</template>
