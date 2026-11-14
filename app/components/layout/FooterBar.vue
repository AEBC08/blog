<script setup lang="ts">
const appConfig = useAppConfig()
const footer = appConfig.footer
const year = new Date().getFullYear()
const avatar = resolveCoverImage(appConfig.profile.avatar)
// Fallback for a missing avatar: the first character of the site title.
const initial = appConfig.site.title.slice(0, 1).toUpperCase()

const copyright = footer.copyright
  .replace('{year}', String(year))
  .replace('{author}', appConfig.site.author)

const links = [
  ...footer.techLinks,
  ...footer.extraLinks,
]
</script>

<template>
  <footer class="mt-16 border-t border-app-divider py-8">
    <div class="mx-auto flex max-w-6xl flex-col items-center gap-2.5 px-4 text-center sm:px-6">
      <div class="flex items-center gap-2.5">
        <template v-if="footer.showAvatar">
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
        </template>
        <p class="text-sm font-medium text-app-text">
          {{ copyright }}
        </p>
      </div>

      <p v-if="footer.license.label" class="text-[11px] leading-5 text-app-text-faint">
        {{ footer.license.prefix }}
        <a
          :href="footer.license.url"
          target="_blank"
          rel="noopener noreferrer"
          class="underline decoration-app-border-strong underline-offset-2 transition-colors hover:text-app-primary-text"
        >{{ footer.license.label }}</a>
        {{ footer.license.suffix }}
      </p>

      <div v-if="links.length" class="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-[11px] leading-5 text-app-text-faint">
        <a
          v-for="item in links"
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
