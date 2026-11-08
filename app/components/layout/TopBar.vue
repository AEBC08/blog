<script setup lang="ts">
import { MiuixCard } from 'miuix-vue'

const appConfig = useAppConfig()
const route = useRoute()

function isActive(to: string): boolean {
  const path = normalizeContentPath(route.path)

  if (path === to) {
    return true
  }

  if (to !== '/posts') {
    return false
  }

  const matchesAnotherNavItem = appConfig.navigation.some(item => item.to !== '/posts' && path === item.to)

  return path.startsWith('/posts/') && !matchesAnotherNavItem
}
</script>

<template>
  <header class="sticky top-0 z-50 px-3 pt-3 sm:px-6">
    <MiuixCard class="topbar-card mx-auto max-w-6xl rounded-2xl">
      <div class="flex items-center gap-2 px-2.5 py-2 sm:gap-4 sm:px-4">
        <NuxtLink to="/" class="flex min-w-0 items-center gap-2.5 rounded-xl px-1 py-0.5">
          <span class="grid size-9 shrink-0 place-items-center rounded-xl bg-app-primary text-base font-extrabold text-app-on-primary">
            A
          </span>
          <span class="hidden min-w-0 sm:block">
            <span class="block truncate text-sm font-bold leading-tight text-app-text">{{ appConfig.site.title }}</span>
            <span class="block truncate text-[11px] leading-tight text-app-text-faint">{{ appConfig.site.tagline }}</span>
          </span>
        </NuxtLink>

        <nav class="ml-auto flex items-center gap-0.5 rounded-full bg-app-bg-soft p-1">
          <NuxtLink
            v-for="item in appConfig.navigation"
            :key="item.to"
            :to="item.to"
            class="rounded-full px-2.5 py-1.5 text-xs font-semibold transition-colors sm:px-3.5 sm:text-sm"
            :class="isActive(item.to)
              ? 'bg-app-primary-soft text-app-primary-text'
              : 'text-app-text-variant hover:text-app-text'"
          >
            {{ item.label }}
          </NuxtLink>
        </nav>

        <div class="flex items-center gap-0.5">
          <a
            href="https://github.com/AEBC08"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            class="hidden size-9 place-items-center rounded-full text-app-text-variant transition-colors hover:bg-app-primary-soft hover:text-app-primary-text sm:grid"
          >
            <Icon name="brand-github" :size="18" />
          </a>
          <ThemeToggle />
        </div>
      </div>
    </MiuixCard>
  </header>
</template>
