/**
 * v-img-fade —— 图片加载完成后淡入。
 *
 * 隐藏态由 JS 在 mounted 时添加：SSR 输出里图片始终可见（无 JS 不退化）；
 * 水合时图片若已加载完成（缓存）则不做任何处理，避免无意义的透明闪烁。
 * 懒加载由各组件自己通过 loading="lazy" 控制，这里只管淡入。
 */
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('img-fade', {
    getSSRProps: () => ({}),
    mounted(el: HTMLElement) {
      const img = el as HTMLImageElement

      if (img.tagName !== 'IMG' || img.complete) {
        return
      }

      img.classList.add('img-fade', 'img-fade-hidden')

      const reveal = (): void => {
        img.classList.remove('img-fade-hidden')
      }

      img.addEventListener('load', reveal, { once: true })
      img.addEventListener('error', reveal, { once: true })
    },
  })
})
