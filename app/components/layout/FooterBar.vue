<script setup lang="ts">
interface TechLink {
  label: string
  href: string
  /** Registry icon name, see `app/utils/icon-registry.ts`. */
  icon: string
}

const appConfig = useAppConfig()
const year = new Date().getFullYear()
const avatar = resolveCoverImage(appConfig.profile.avatar)
// Fallback for a missing avatar: the first character of the site title.
const initial = appConfig.site.title.slice(0, 1).toUpperCase()

const TECH_LINKS: TechLink[] = [
  { label: 'Nuxt 4', href: 'https://nuxt.com', icon: 'brand-nuxt' },
  { label: 'Nuxt Content', href: 'https://content.nuxt.com', icon: 'miuix:File' },
  { label: 'miuix-vue', href: 'https://github.com/YuKongA/miuix-vue', icon: 'brand-vue' },
  { label: 'GitHub Pages', href: 'https://pages.github.com', icon: 'brand-github' },
]

const LICENSE_URL = 'https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh-hans'
</script>

<template>
  <footer class="mt-16 border-t border-app-divider py-8">
    <div class="mx-auto flex max-w-6xl flex-col items-center gap-2.5 px-4 text-center sm:px-6">
      <div class="flex items-center gap-2.5">
        <img
          v-if="avatar"
          :src="avatar"
          :alt="appConfig.profile.name"
          class="size-7 shrink-0 rounded-lg border border-app-border object-cover"
          width="28"
          height="28"
        >
        <span
          v-else
          class="grid size-7 shrink-0 place-items-center rounded-lg bg-app-primary text-xs font-extrabold text-app-on-primary"
        >
          {{ initial }}
        </span>
        <p class="text-sm font-medium text-app-text">
          © {{ year }} {{ appConfig.site.author }}
        </p>
      </div>

      <p class="text-[11px] leading-5 text-app-text-faint">
        内容采用
        <a
          :href="LICENSE_URL"
          target="_blank"
          rel="noopener noreferrer"
          class="underline decoration-app-border-strong underline-offset-2 transition-colors hover:text-app-primary-text"
        >CC BY-NC-SA 4.0</a>
        许可协议
      </p>

      <div class="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-[11px] leading-5 text-app-text-faint">
        <a
          v-for="item in TECH_LINKS"
          :key="item.href"
          :href="item.href"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-1 transition-colors hover:text-app-primary-text"
        >
          <Icon :name="item.icon" :size="12" />
          {{ item.label }}
        </a>
      </div>
    </div>
  </footer>
</template>
