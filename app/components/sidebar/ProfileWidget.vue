<script setup lang="ts">
import { MiuixCard } from 'miuix-vue'

const appConfig = useAppConfig()
const avatar = resolveCoverImage(appConfig.profile.avatar)
</script>

<template>
  <MiuixCard class="overflow-hidden">
    <div class="flex flex-col items-center px-5 pb-5 pt-6 text-center">
      <img
        v-if="avatar"
        :src="avatar"
        :alt="appConfig.profile.name"
        class="size-16 rounded-2xl border border-app-border object-cover"
        width="64"
        height="64"
      >

      <h2 class="mt-3 text-lg font-bold text-app-text">
        {{ appConfig.profile.name }}
      </h2>
      <p v-if="appConfig.profile.status" class="mt-0.5 flex items-center gap-1.5 text-[11px] font-medium text-app-primary-text">
        <span class="inline-block size-1.5 rounded-full bg-emerald-500" />
        {{ appConfig.profile.status }}
      </p>
      <p class="mt-2 text-sm leading-6 text-app-text-variant">
        {{ appConfig.profile.bio }}
      </p>

      <div class="mt-4 flex flex-wrap justify-center gap-2">
        <NuxtLink
          v-for="link in appConfig.profile.links"
          :key="link.label"
          :to="link.href"
          :target="link.href.startsWith('http') ? '_blank' : undefined"
          :rel="link.href.startsWith('http') ? 'noopener noreferrer' : undefined"
          class="inline-flex items-center gap-1.5 rounded-full border border-app-divider bg-app-bg-soft px-3 py-1.5 text-xs font-medium text-app-text-variant transition-colors hover:border-app-primary/40 hover:text-app-primary-text"
        >
          <Icon :name="link.icon" :size="14" />
          {{ link.label }}
        </NuxtLink>
      </div>
    </div>
  </MiuixCard>
</template>
