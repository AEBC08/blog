<script setup lang="ts">
import type { TocLink } from '@nuxt/content'
import { MiuixCard } from 'miuix-vue'

const { page } = await useBlogPost()
const links = computed<TocLink[]>(() => page.value?.body.toc?.links ?? [])

interface FlatLink {
  id: string
  text: string
  depth: number
}

/** 拍平两级目录（h2 / h3），观测与渲染共用同一份列表。 */
const flatLinks = computed<FlatLink[]>(() =>
  links.value.flatMap(link => [
    { id: link.id, text: link.text, depth: link.depth },
    ...(link.children ?? []).map(child => ({
      id: child.id,
      text: child.text,
      depth: child.depth,
    })),
  ]))

const activeId = ref('')
const navEl = ref<HTMLElement | null>(null)
let frame = 0
let elements: HTMLElement[] = []

function update(): void {
  frame = 0

  // 与 sticky 顶栏错开：越过这条基准线的最后一个标题就是当前章节；
  // 还没越过任何标题时高亮第一项，避免目录出现“全灰”状态。
  const line = 120
  let current = elements[0]?.id ?? ''

  for (const el of elements) {
    if (el.getBoundingClientRect().top > line) {
      break
    }

    current = el.id
  }

  // 滚到页底时强制选中最后一个标题，避免尾段太短导致高亮回跳。
  const doc = document.documentElement
  if (elements.length > 0 && window.innerHeight + window.scrollY >= doc.scrollHeight - 4) {
    current = elements[elements.length - 1]?.id ?? current
  }

  activeId.value = current
}

function onScroll(): void {
  if (frame !== 0) {
    return
  }

  frame = window.requestAnimationFrame(update)
}

// 高亮变化时把当前项滚进目录容器的视野。只改 nav.scrollTop，绝不使用
// scrollIntoView——它会连带滚动页面，与用户的滚动打架产生“回弹”。
function scrollActiveIntoView(): void {
  const nav = navEl.value
  const target = nav?.querySelector<HTMLElement>('[data-active="true"]')

  if (!nav || !target) {
    return
  }

  const navRect = nav.getBoundingClientRect()
  const targetRect = target.getBoundingClientRect()

  if (targetRect.top < navRect.top || targetRect.bottom > navRect.bottom) {
    nav.scrollTop += targetRect.top - navRect.top - (nav.clientHeight - targetRect.height) / 2
  }
}

watch(activeId, () => {
  nextTick(scrollActiveIntoView)
})

onMounted(() => {
  elements = flatLinks.value
    .map(link => document.getElementById(link.id))
    .filter((element): element is HTMLElement => element !== null)

  if (elements.length === 0) {
    return
  }

  update()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onScroll)

  if (frame !== 0) {
    window.cancelAnimationFrame(frame)
  }
})
</script>

<template>
  <MiuixCard v-if="flatLinks.length">
    <div class="p-5">
      <h2 class="widget-title flex items-center gap-2 text-sm font-bold text-app-text">
        <Icon name="miuix:ListView" class="text-app-primary-text" :size="16" />
        目录
      </h2>

      <nav ref="navEl" class="mt-3 max-h-[60vh] space-y-0.5 overflow-y-auto">
        <a
          v-for="link in flatLinks"
          :key="link.id"
          :href="`#${link.id}`"
          :data-active="activeId === link.id"
          class="group flex items-start gap-2 rounded-lg py-1.5 pr-2 text-sm leading-5 transition-colors"
          :class="activeId === link.id
            ? 'font-semibold text-app-primary-text'
            : 'text-app-text-variant hover:text-app-text'"
          :style="{ paddingLeft: `${Math.max(link.depth - 2, 0) * 0.75 + 0.5}rem` }"
        >
          <span
            class="mt-[0.45rem] inline-block size-1.5 shrink-0 rounded-full transition-colors"
            :class="activeId === link.id ? 'bg-app-primary' : 'bg-app-border-strong group-hover:bg-app-primary/60'"
          />
          <span>{{ link.text }}</span>
        </a>
      </nav>
    </div>
  </MiuixCard>
</template>
