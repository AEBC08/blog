<script setup lang="ts">
const appConfig = useAppConfig()
const year = new Date().getFullYear()
</script>

<template>
  <footer class="mt-16 border-t border-app-divider py-8">
    <div class="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 text-center sm:px-6">
      <div class="flex items-center gap-2.5">
        <span class="grid size-7 place-items-center rounded-lg bg-app-primary text-xs font-extrabold text-app-on-primary">
          M
        </span>
        <p class="text-sm font-medium text-app-text">
          © {{ year }} {{ appConfig.site.author }}
        </p>
      </div>
      <div class="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-[11px] leading-5 text-app-text-faint">
        <span class="inline-flex items-center gap-1"><Icon name="brand-nuxt" :size="12" /> Nuxt 4</span>
        <span class="inline-flex items-center gap-1"><Icon name="miuix:File" :size="12" /> Nuxt Content</span>
        <span class="inline-flex items-center gap-1"><Icon name="brand-vue" :size="12" /> miuix-vue</span>
        <span class="inline-flex items-center gap-1"><Icon name="brand-github" :size="12" /> GitHub Pages</span>
      </div>
    </div>
  </footer>
</template>
