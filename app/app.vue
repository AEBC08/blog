<script setup lang="ts">
const appConfig = useAppConfig()
// The tab icon *is* the site avatar, so replacing the avatar also replaces the
// favicon. Both point at the same file to avoid a second asset to keep in sync.
const avatar = resolveCoverImage(appConfig.profile.avatar)

const iconLinks = avatar
  ? [
      { rel: 'icon', type: 'image/jpeg', href: avatar } as const,
      { rel: 'apple-touch-icon', href: avatar } as const,
    ]
  : []

useHead({
  titleTemplate: title => title
    ? `${title} · ${appConfig.site.title}`
    : appConfig.site.title,
  link: iconLinks,
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
