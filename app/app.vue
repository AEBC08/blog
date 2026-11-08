<script setup lang="ts">
const appConfig = useAppConfig()
const favicon = resolveCoverImage('/favicon.svg') ?? '/favicon.svg'

useHead({
  titleTemplate: title => title
    ? `${title} · ${appConfig.site.title}`
    : appConfig.site.title,
  link: [
    { rel: 'icon', type: 'image/svg+xml', href: favicon },
  ],
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
