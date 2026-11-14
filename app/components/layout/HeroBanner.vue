<script setup lang="ts">
interface MotionPreset {
  duration: number
  stagger: number
  distance: number
}

const props = defineProps<{
  postCount: number
  categoryCount: number
  tagCount: number
}>()

const PRESETS = {
  subtle: { duration: 0.75, stagger: 0.7, distance: 0.45 },
  standard: { duration: 1, stagger: 1, distance: 1 },
  playful: { duration: 1.2, stagger: 1.2, distance: 1.5 },
} satisfies Record<string, MotionPreset>

const DEFAULT_PRESET: MotionPreset = { duration: 1, stagger: 1, distance: 1 }

const appConfig = useAppConfig()
const hero = appConfig.hero
const motion = hero.motion

const preset = computed<MotionPreset>(() => PRESETS[motion.preset as keyof typeof PRESETS] ?? DEFAULT_PRESET)

// Motion is expressed as CSS custom properties, so every keyframe below can be
// retuned from app.config.ts without touching the template or the stylesheet.
const motionStyle = computed<Record<string, string>>(() => ({
  '--hero-duration': `${(motion.duration * preset.value.duration).toFixed(3)}s`,
  '--hero-stagger': `${(motion.stagger * preset.value.stagger).toFixed(3)}s`,
  '--hero-delay': `${motion.delay.toFixed(3)}s`,
  '--hero-distance': `${Math.round(motion.distance * preset.value.distance)}px`,
}))

const surfaceClass = computed(() => {
  if (hero.appearance === 'light') {
    return 'hero-surface-light'
  }

  if (hero.appearance === 'dark') {
    return 'hero-surface-dark'
  }

  return 'hero-appearance-auto'
})

const title = computed(() => hero.title || appConfig.profile.name)
const tagline = computed(() => hero.tagline || appConfig.site.tagline)
const brandLabel = computed(() => hero.decoration.brandLabel || appConfig.site.title)
const avatar = resolveCoverImage(appConfig.profile.avatar)
const lightBanner = resolveCoverImage('/banner-light.svg')
const darkBanner = resolveCoverImage('/banner.svg')

const counts = computed<Record<string, number>>(() => ({
  posts: props.postCount,
  categories: props.categoryCount,
  tags: props.tagCount,
}))

const stats = computed(() => hero.stats
  .filter(stat => stat.enabled)
  .map(stat => ({ ...stat, value: counts.value[stat.key] ?? 0 })))

// Seeded with the real values so SSR and hydration agree; the count-up starts
// only after mount, while the staggered entrance is still hiding the numbers.
const statValues = reactive<Record<string, number>>({})
for (const stat of stats.value) {
  statValues[stat.key] = stat.value
}

const rootEl = ref<HTMLElement | null>(null)
let frameId = 0
let parallaxActive = false

onMounted(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  parallaxActive = motion.enabled && motion.parallax && !reduceMotion
    && window.matchMedia('(pointer: fine)').matches

  if (!motion.enabled || !motion.countUp || reduceMotion) {
    return
  }

  const targets = stats.value
  const duration = Math.max(300, 900 * preset.value.duration)
  const start = performance.now()

  for (const stat of targets) {
    statValues[stat.key] = 0
  }

  function tick(now: number): void {
    const progress = Math.min((now - start) / duration, 1)
    const eased = 1 - (1 - progress) ** 3

    for (const stat of targets) {
      statValues[stat.key] = Math.round(stat.value * eased)
    }

    if (progress < 1) {
      frameId = requestAnimationFrame(tick)
    }
  }

  frameId = requestAnimationFrame(tick)
})

onBeforeUnmount(() => {
  if (frameId) {
    cancelAnimationFrame(frameId)
  }
})

function onPointerMove(event: PointerEvent): void {
  if (!parallaxActive || !rootEl.value) {
    return
  }

  const rect = rootEl.value.getBoundingClientRect()

  if (!rect.width || !rect.height) {
    return
  }

  const dx = (event.clientX - rect.left) / rect.width - 0.5
  const dy = (event.clientY - rect.top) / rect.height - 0.5
  rootEl.value.style.setProperty('--hero-px', `${(dx * 20).toFixed(2)}px`)
  rootEl.value.style.setProperty('--hero-py', `${(dy * 14).toFixed(2)}px`)
}

function onPointerLeave(): void {
  if (!rootEl.value) {
    return
  }

  rootEl.value.style.setProperty('--hero-px', '0px')
  rootEl.value.style.setProperty('--hero-py', '0px')
}
</script>

<template>
  <section
    ref="rootEl"
    class="hero relative isolate overflow-hidden rounded-[1.25rem] border border-app-border shadow-[var(--app-shadow)]"
    :class="[
      surfaceClass,
      {
        'hero-motion-off': !motion.enabled,
        'hero-preset-playful': motion.enabled && motion.preset === 'playful',
      },
    ]"
    :style="motionStyle"
    @pointermove="onPointerMove"
    @pointerleave="onPointerLeave"
  >
    <!-- Everything behind the copy is decorative and pointer-transparent. -->
    <div class="hero-parallax absolute inset-0 z-0">
      <div
        class="hero-bg-stage absolute inset-0"
        :class="{ 'hero-bg-animated': motion.enabled && motion.background }"
      >
        <template v-if="hero.background === 'image'">
          <img
            v-if="lightBanner"
            :src="lightBanner"
            alt=""
            class="hero-bg-img hero-bg-img--light absolute inset-0 h-full w-full object-cover"
          >
          <img
            v-if="darkBanner"
            :src="darkBanner"
            alt=""
            class="hero-bg-img hero-bg-img--dark absolute inset-0 h-full w-full object-cover"
          >
        </template>

        <template v-else>
          <div class="hero-surface absolute inset-0" />
          <div
            v-if="hero.decoration.glow"
            class="hero-glow absolute inset-0"
            :class="{ 'hero-float': motion.enabled && motion.float }"
          />
          <div v-if="hero.decoration.grid" class="hero-grid absolute inset-0" />
          <svg
            v-if="hero.decoration.monogram || hero.decoration.accentBar"
            class="hero-monogram absolute right-[8%] top-[6%] h-[68%] w-[26%]"
            :class="[
              { 'hero-draw': motion.enabled && motion.background },
              { 'hero-accent-grow': motion.enabled && hero.decoration.accentBar },
            ]"
            viewBox="0 0 320 380"
            preserveAspectRatio="xMidYMid meet"
            aria-hidden="true"
          >
            <g v-if="hero.decoration.monogram">
              <path d="M10 320L160 20L310 320" />
              <path d="M70 210H250" />
            </g>
            <template v-if="hero.decoration.accentBar">
              <line class="hero-accent-line" x1="10" y1="360" x2="310" y2="360" />
              <line class="hero-accent-line-fill" x1="10" y1="360" x2="106" y2="360" />
            </template>
          </svg>
        </template>

        <!-- 品牌标记在两种背景模式下都由 site.config.ts 驱动。 -->
        <div class="hero-brand absolute flex flex-col items-start gap-2">
          <span v-if="hero.decoration.brandMark" class="hero-brand-mark" />
          <span v-if="brandLabel" class="hero-brand-label">{{ brandLabel }}</span>
        </div>
      </div>
    </div>

    <div class="relative z-10 flex min-h-[22rem] flex-col justify-end p-6 sm:min-h-[26rem] sm:p-10">
      <div class="flex items-center gap-4">
        <div class="hero-enter shrink-0" :style="{ '--hero-i': '0' }">
          <img
            v-if="hero.showAvatar && avatar"
            :src="avatar"
            :alt="appConfig.profile.name"
            class="size-16 rounded-2xl object-cover ring-1 ring-hero-line sm:size-20"
            width="80"
            height="80"
          >
        </div>
        <div class="hero-enter" :style="{ '--hero-i': '1' }">
          <p class="text-[11px] font-medium tracking-[0.16em] text-hero-text-faint">
            {{ hero.eyebrow }}
          </p>
          <h1 class="mt-1 text-3xl font-extrabold leading-none text-hero-text sm:text-5xl">
            {{ title }}<span v-if="hero.titleSuffix" class="text-hero-accent-text">{{ hero.titleSuffix }}</span>
          </h1>
        </div>
      </div>

      <p class="hero-enter mt-4 max-w-xl text-sm leading-7 text-hero-text-soft sm:text-base" :style="{ '--hero-i': '2' }">
        {{ tagline }}
      </p>

      <div class="mt-6 flex flex-wrap items-center gap-3">
        <div
          v-for="(action, index) in hero.actions"
          :key="action.to"
          class="hero-enter"
          :style="{ '--hero-i': String(3 + index) }"
        >
          <NuxtLink
            :to="action.to"
            class="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200"
            :class="[
              action.variant === 'primary'
                ? 'bg-hero-accent text-hero-on-accent hover:opacity-90'
                : 'border border-hero-line bg-hero-ghost text-hero-text-soft hover:bg-hero-ghost-hover hover:text-hero-text',
              motion.enabled && motion.hover ? 'hover:-translate-y-0.5' : '',
            ]"
          >
            <Icon v-if="action.icon && action.variant !== 'primary'" :name="action.icon" :size="16" />
            {{ action.label }}
            <Icon v-if="action.icon && action.variant === 'primary'" :name="action.icon" :size="16" />
          </NuxtLink>
        </div>

        <div class="flex items-center gap-5 text-hero-text-faint sm:ml-auto">
          <template v-for="(stat, index) in stats" :key="stat.key">
            <span
              v-if="index > 0"
              class="hero-enter h-8 w-px bg-hero-line"
              :style="{ '--hero-i': String(3 + hero.actions.length + index) }"
            />
            <div class="hero-enter" :style="{ '--hero-i': String(3 + hero.actions.length + index) }">
              <p class="text-xl font-bold leading-none text-hero-text">
                {{ statValues[stat.key] ?? 0 }}
              </p>
              <p class="mt-1 flex items-center gap-1 text-[11px] tracking-[0.08em]">
                <Icon :name="stat.icon" :size="12" />
                {{ stat.label }}
              </p>
            </div>
          </template>
        </div>
      </div>
    </div>
  </section>
</template>
