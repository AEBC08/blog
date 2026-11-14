/**
 * v-reveal —— 元素进入视口时渐显上浮。
 *
 * 隐藏态只由 JS 在 mounted 时加 `.reveal` 类触发：SSR 输出和未执行 JS 的
 * 环境里内容始终可见，不会出现「没 JS 就全白屏」的退化。开关在
 * site.config.effects.reveal，关闭时指令直接放行不做任何隐藏。
 *
 * 用法：<div v-reveal> 或带错峰延迟 <div v-reveal="{ delay: 60 }">
 */
import type { DirectiveBinding } from 'vue'

interface RevealOptions {
  /** 进入视口后的动画延迟（毫秒），用于卡片错峰。 */
  delay?: number
}

const observerMap = new WeakMap<HTMLElement, IntersectionObserver>()

function getObserver(): IntersectionObserver {
  return new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const el = entry.target as HTMLElement
          el.classList.add('reveal-visible')
          observerMap.get(el)?.disconnect()
          observerMap.delete(el)
        }
      }
    },
    {
      // 稍微往下探一点再触发，避免卡片刚露出一条边就开始动画。
      rootMargin: '0px 0px -6% 0px',
      threshold: 0.05,
    },
  )
}

export default defineNuxtPlugin((nuxtApp) => {
  const effects = (useAppConfig() as { effects?: { reveal?: boolean } }).effects

  nuxtApp.vueApp.directive('reveal', {
    getSSRProps: () => ({}),
    mounted(el: HTMLElement, binding: DirectiveBinding<RevealOptions>) {
      if (effects && effects.reveal === false) {
        return
      }

      const { delay = 0 } = binding.value ?? {}

      if (delay > 0) {
        el.style.setProperty('--reveal-delay', `${delay}ms`)
      }

      el.classList.add('reveal')

      const io = getObserver()
      observerMap.set(el, io)
      io.observe(el)
    },
    unmounted(el: HTMLElement) {
      observerMap.get(el)?.disconnect()
      observerMap.delete(el)
    },
  })
})
