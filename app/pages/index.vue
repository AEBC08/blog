<script setup lang="ts">
import { MiuixCard } from 'miuix-vue'

const appConfig = useAppConfig()
const { posts } = await useBlogList()
const { categories, tags } = await useSidebarData()

const banner = resolveCoverImage('/banner.svg')
const avatar = resolveCoverImage(appConfig.profile.avatar)

const latestPosts = computed(() => posts.value.slice(0, 5))
const featuredPost = computed(() => latestPosts.value[0] ?? null)
const restPosts = computed(() => latestPosts.value.slice(1))

useSeoMeta({
  title: '首页',
  description: appConfig.site.description,
})
</script>

<template>
  <MainGrid>
    <template #hero>
      <section class="relative isolate overflow-hidden rounded-[1.25rem] border border-app-border shadow-[var(--app-shadow)]">
        <img v-if="banner" :src="banner" alt="" class="absolute inset-0 -z-10 h-full w-full object-cover">

        <div class="flex min-h-[22rem] flex-col justify-end p-6 sm:min-h-[26rem] sm:p-10">
          <div class="animate-fade-up">
            <div class="flex items-center gap-4">
              <img
                v-if="avatar"
                :src="avatar"
                :alt="appConfig.profile.name"
                class="size-16 rounded-2xl object-cover ring-1 ring-white/20 sm:size-20"
                width="80"
                height="80"
              >
              <div>
                <p class="text-[11px] font-medium tracking-[0.16em] text-white/55">
                  个人博客
                </p>
                <h1 class="mt-1 text-3xl font-extrabold leading-none text-white sm:text-5xl">
                  {{ appConfig.profile.name }}<span class="text-app-primary">.</span>
                </h1>
              </div>
            </div>

            <p class="mt-4 max-w-xl text-sm leading-7 text-white/70 sm:text-base">
              {{ appConfig.site.tagline }}
            </p>

            <div class="mt-6 flex flex-wrap items-center gap-3">
              <NuxtLink
                to="/posts"
                class="inline-flex items-center gap-2 rounded-full bg-app-primary px-5 py-2.5 text-sm font-bold text-app-on-primary transition-colors hover:bg-app-primary/90"
              >
                开始阅读
                <Icon name="arrow-right" :size="16" />
              </NuxtLink>
              <NuxtLink
                to="/about"
                class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white/85 transition-colors hover:bg-white/10 hover:text-white"
              >
                <Icon name="user" :size="16" />
                关于我
              </NuxtLink>

              <div class="flex items-center gap-5 text-white/60 sm:ml-auto">
                <div>
                  <p class="text-xl font-bold leading-none text-white">
                    {{ posts.length }}
                  </p>
                  <p class="mt-1 flex items-center gap-1 text-[11px] tracking-[0.08em]">
                    <Icon name="miuix:File" :size="12" />
                    文章
                  </p>
                </div>
                <span class="h-8 w-px bg-white/15" />
                <div>
                  <p class="text-xl font-bold leading-none text-white">
                    {{ categories.length }}
                  </p>
                  <p class="mt-1 flex items-center gap-1 text-[11px] tracking-[0.08em]">
                    <Icon name="miuix:Folder" :size="12" />
                    分类
                  </p>
                </div>
                <span class="h-8 w-px bg-white/15" />
                <div>
                  <p class="text-xl font-bold leading-none text-white">
                    {{ tags.length }}
                  </p>
                  <p class="mt-1 flex items-center gap-1 text-[11px] tracking-[0.08em]">
                    <Icon name="tag" :size="12" />
                    标签
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </template>

    <div class="space-y-6">
      <section>
        <div class="mb-4 flex items-end justify-between gap-4">
          <div>
            <p class="text-xs font-medium text-app-primary">
              最新
            </p>
            <h2 class="mt-1 text-2xl font-bold text-app-text">
              最新文章
            </h2>
          </div>
          <NuxtLink
            to="/posts"
            class="group inline-flex items-center gap-1.5 rounded-full border border-app-divider bg-app-card px-4 py-2 text-sm font-semibold text-app-text-variant shadow-sm transition-colors hover:border-app-primary/40 hover:text-app-primary"
          >
            全部文章
            <Icon name="arrow-right" class="transition-transform group-hover:translate-x-0.5" :size="16" />
          </NuxtLink>
        </div>

        <PostCard v-if="featuredPost" :post="featuredPost" featured class="mb-4" />
        <PostList :posts="restPosts" />
      </section>

      <MiuixCard>
        <section class="p-5 sm:p-6">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p class="text-xs font-medium text-app-primary">
                分类
              </p>
              <h2 class="mt-1 text-lg font-bold text-app-text">
                按分类浏览
              </h2>
            </div>
            <NuxtLink to="/posts" class="text-sm font-medium text-app-primary hover:underline">
              查看全部
            </NuxtLink>
          </div>

          <div class="mt-4 flex flex-wrap gap-2">
            <NuxtLink
              v-for="category in categories"
              :key="category.name"
              :to="{ path: '/posts', query: { category: category.name } }"
              class="inline-flex items-center gap-2 rounded-full border border-app-divider bg-app-bg-soft px-3.5 py-2 text-sm font-medium text-app-text-variant transition-colors hover:border-app-primary/40 hover:text-app-primary"
            >
              <Icon name="miuix:Folder" :size="14" />
              {{ category.name }}
              <span class="rounded-full bg-app-primary-soft px-1.5 py-0.5 text-[10px] font-bold text-app-primary">{{ category.count }}</span>
            </NuxtLink>
          </div>
        </section>
      </MiuixCard>
    </div>

    <template #sidebar>
      <SidebarPanel />
    </template>
  </MainGrid>
</template>
