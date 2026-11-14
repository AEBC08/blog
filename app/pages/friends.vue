<script setup lang="ts">
import { MiuixCard } from 'miuix-vue'

const appConfig = useAppConfig()
const friends = computed(() => appConfig.friends?.links ?? [])
const intro = computed(() => appConfig.friends?.intro)

// 本站信息优先读 site.config.siteInfo 的独立配置，留空的字段回退到站点默认值。
const siteInfo = computed(() => ({
  name: appConfig.siteInfo?.name || appConfig.site.title,
  url: appConfig.siteInfo?.url || appConfig.site.url,
  avatar: appConfig.siteInfo?.avatar || appConfig.profile.avatar,
  description: appConfig.siteInfo?.description || appConfig.site.description || appConfig.site.tagline,
}))

const displayAvatar = computed(() =>
  siteInfo.value.avatar
    ? resolveCoverImage(siteInfo.value.avatar)
    : undefined)

// 复制给对方时头像需要完整 URL（本地路径自动补部署前缀）。
const absoluteAvatar = computed(() =>
  siteInfo.value.avatar
    ? resolveCoverImage(siteInfo.value.avatar) ?? ''
    : '')

interface InfoField {
  key: string
  label: string
  value: string
}

const fields = computed<InfoField[]>(() => [
  { key: 'name', label: '站点名称', value: siteInfo.value.name },
  { key: 'url', label: '站点地址', value: siteInfo.value.url },
  { key: 'avatar', label: '站点头像', value: absoluteAvatar.value },
  { key: 'description', label: '站点描述', value: siteInfo.value.description },
].filter(field => Boolean(field.value)))

async function copyText(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text)
  }
  catch {
    // Clipboard API 不可用（http 环境等）时退回 execCommand。
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    textarea.remove()
  }
}

// 每个字段独立的复制反馈，全部复制共用一个 key。
const copiedKey = ref('')
let copiedTimer = 0

function flashCopied(key: string): void {
  copiedKey.value = key
  window.clearTimeout(copiedTimer)
  copiedTimer = window.setTimeout(() => {
    copiedKey.value = ''
  }, 2000)
}

async function copyField(field: InfoField): Promise<void> {
  await copyText(copyableValue(field))
  flashCopied(field.key)
}

// 复制出去的必须是完整 URL：站内相对路径（如头像）补上协议与域名，
// 只在点击处理（客户端）中调用，不参与 SSR 渲染。
function copyableValue(field: InfoField): string {
  if (field.value.startsWith('/') && !field.value.startsWith('//')) {
    return `${window.location.origin}${field.value}`
  }

  return field.value
}

async function copyAll(): Promise<void> {
  const lines = fields.value.map(field => `${field.label}：${copyableValue(field)}`)

  await copyText(lines.join('\n'))
  flashCopied('all')
}

onBeforeUnmount(() => {
  window.clearTimeout(copiedTimer)
})

useSeoMeta({
  title: '友链',
  description: () => `${appConfig.site.title} 的友链页面`,
  ogTitle: '友链',
  ogDescription: () => `${appConfig.site.title} 的友链页面`,
})
</script>

<template>
  <div class="mx-auto w-full max-w-4xl px-4 sm:px-6">
    <MiuixCard>
      <header class="p-6 sm:p-8">
        <p class="text-xs font-medium text-app-primary-text">
          Friends
        </p>
        <h1 class="mt-1 text-2xl font-bold leading-tight text-app-text sm:text-3xl">
          友链
        </h1>
        <p v-if="intro" class="mt-3 max-w-2xl text-sm leading-7 text-app-text-variant">
          {{ intro }}
        </p>
      </header>

      <div class="border-t border-app-divider p-4 sm:p-6">
        <h2 class="flex items-center gap-2 text-sm font-bold text-app-text">
          <Icon name="home" class="text-app-primary-text" :size="15" />
          本站信息
        </h2>

        <div class="mt-3 rounded-2xl border border-app-divider bg-app-card p-3.5 shadow-sm">
          <div class="flex items-center gap-3">
            <img
              v-if="displayAvatar"
              v-img-fade
              :src="displayAvatar"
              :alt="siteInfo.name"
              class="size-10 shrink-0 rounded-xl border border-app-border object-cover"
              width="40"
              height="40"
              decoding="async"
            >
            <span
              v-else
              class="grid size-10 shrink-0 place-items-center rounded-xl bg-app-primary-soft text-base font-bold text-app-primary-text"
            >
              {{ siteInfo.name.slice(0, 1).toUpperCase() }}
            </span>
            <span class="min-w-0 flex-1">
              <span class="block truncate text-sm font-semibold text-app-text">{{ siteInfo.name }}</span>
              <span class="mt-0.5 line-clamp-2 block text-xs leading-5 text-app-text-variant">{{ siteInfo.description }}</span>
            </span>
            <button
              type="button"
              class="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-app-primary-soft px-3.5 py-2 text-xs font-semibold text-app-primary-text transition-colors hover:bg-app-primary hover:text-app-on-primary"
              @click="copyAll"
            >
              <Icon :name="copiedKey === 'all' ? 'check' : 'copy'" :size="14" />
              {{ copiedKey === 'all' ? '已复制' : '全部复制' }}
            </button>
          </div>

          <div class="mt-3 space-y-1 border-t border-app-divider pt-3">
            <div
              v-for="field in fields"
              :key="field.key"
              class="flex items-center gap-2 text-xs"
            >
              <span class="w-16 shrink-0 text-app-text-faint">{{ field.label }}</span>
              <span class="min-w-0 flex-1 truncate text-app-text-variant" :title="field.value">{{ field.value }}</span>
              <button
                type="button"
                class="grid size-7 shrink-0 place-items-center rounded-full text-app-text-faint transition-colors hover:bg-app-primary-soft hover:text-app-primary-text"
                :aria-label="`复制${field.label}`"
                @click="copyField(field)"
              >
                <Icon :name="copiedKey === field.key ? 'check' : 'copy'" :size="13" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="border-t border-app-divider p-4 sm:p-6">
        <h2 class="flex items-center gap-2 text-sm font-bold text-app-text">
          <Icon name="link" class="text-app-primary-text" :size="15" />
          朋友们
          <span v-if="friends.length" class="rounded-full bg-app-bg-soft px-1.5 py-0.5 text-[10px] font-semibold text-app-text-faint">
            {{ friends.length }}
          </span>
        </h2>

        <div v-if="friends.length" class="mt-3 grid gap-3 sm:grid-cols-2">
          <div
            v-for="(friend, index) in friends"
            :key="friend.href"
            v-reveal="{ delay: Math.min(index * 50, 250) }"
          >
            <FriendCard v-bind="friend" />
          </div>
        </div>

        <div v-else class="mt-3 flex flex-col items-center justify-center py-8 text-center">
          <span class="grid size-11 place-items-center rounded-2xl bg-app-primary-soft text-app-primary-text">
            <Icon name="link" :size="20" />
          </span>
          <p class="mt-3 text-sm font-medium text-app-text">
            友链虚位以待
          </p>
          <p class="mt-1 text-xs text-app-text-faint">
            想成为第一个朋友？到「关于」页找我吧。
          </p>
        </div>
      </div>
    </MiuixCard>
  </div>
</template>
