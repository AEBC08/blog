<script setup lang="ts">
import { MiuixCard } from 'miuix-vue'

interface Props {
  /** `sidebar` renders inside a MiuixCard, `panel` sits in the top bar popover. */
  variant?: 'sidebar' | 'panel'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'sidebar',
})

const {
  tracks,
  currentTrack,
  index,
  playing,
  time,
  duration,
  mode,
  pending,
  unavailable,
  toggle,
  next,
  previous,
  select,
  cycleMode,
  seek,
} = useMusicPlayer()

const MODE_ICON: Record<string, string> = {
  list: 'repeat',
  one: 'repeat-once',
  shuffle: 'arrows-shuffle',
}

const MODE_LABEL: Record<string, string> = {
  list: '列表循环',
  one: '单曲循环',
  shuffle: '随机播放',
}

const bar = ref<HTMLElement | null>(null)
const dragging = ref(false)
const dragRatio = ref(0)
const listOpen = ref(false)

const modeIcon = computed(() => MODE_ICON[mode.value] ?? 'repeat')

const ratio = computed(() => {
  if (dragging.value) {
    return dragRatio.value
  }

  return duration.value > 0
    ? Math.min(1, time.value / duration.value)
    : 0
})

const elapsed = computed(() => (dragging.value
  ? dragRatio.value * duration.value
  : time.value))

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return '0:00'
  }

  const minutes = Math.floor(seconds / 60)
  const rest = Math.floor(seconds % 60)

  return `${minutes}:${String(rest).padStart(2, '0')}`
}

function ratioFromEvent(event: PointerEvent): number {
  const el = bar.value

  if (!el) {
    return 0
  }

  const rect = el.getBoundingClientRect()

  return Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width))
}

function onSeekStart(event: PointerEvent): void {
  const el = bar.value

  if (!el) {
    return
  }

  dragging.value = true
  dragRatio.value = ratioFromEvent(event)
  el.setPointerCapture(event.pointerId)
}

function onSeekMove(event: PointerEvent): void {
  if (dragging.value) {
    dragRatio.value = ratioFromEvent(event)
  }
}

function onSeekEnd(): void {
  if (!dragging.value) {
    return
  }

  dragging.value = false
  seek(dragRatio.value)
}

function onSeekKey(event: KeyboardEvent): void {
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
    return
  }

  event.preventDefault()
  const step = event.key === 'ArrowLeft'
    ? -5
    : 5
  seek(duration.value > 0
    ? (elapsed.value + step) / duration.value
    : 0)
}
</script>

<template>
  <component
    :is="props.variant === 'sidebar' ? MiuixCard : 'div'"
    :class="props.variant === 'panel' ? 'w-full' : ''"
  >
    <div :class="props.variant === 'sidebar' ? 'p-4' : 'p-3'">
      <div class="flex items-center justify-between">
        <h2 class="widget-title flex items-center gap-2 text-sm font-bold text-app-text">
          <Icon name="miuix:Music" class="text-app-primary-text" :size="16" />
          音乐
        </h2>
        <span class="text-[10px] font-medium text-app-text-faint">{{ tracks.length }} 首</span>
      </div>

      <template v-if="currentTrack">
        <div class="mt-3 flex items-center gap-3">
          <img
            v-if="currentTrack.cover"
            :src="`${currentTrack.cover}?param=120y120`"
            :alt="currentTrack.name"
            class="size-12 shrink-0 rounded-xl border border-app-border object-cover"
            width="48"
            height="48"
            loading="lazy"
          >
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-semibold text-app-text" :title="currentTrack.name">
              {{ currentTrack.name }}
            </p>
            <p class="mt-0.5 truncate text-[11px] text-app-text-faint" :title="currentTrack.artists">
              {{ currentTrack.artists }}
            </p>
          </div>
        </div>

        <div
          ref="bar"
          class="group relative mt-3 flex h-4 cursor-pointer touch-none select-none items-center"
          role="slider"
          tabindex="0"
          aria-label="播放进度"
          :aria-valuemin="0"
          :aria-valuemax="100"
          :aria-valuenow="Math.round(ratio * 100)"
          @pointerdown="onSeekStart"
          @pointermove="onSeekMove"
          @pointerup="onSeekEnd"
          @pointercancel="onSeekEnd"
          @keydown="onSeekKey"
        >
          <div class="h-1 w-full overflow-hidden rounded-full bg-app-text/15">
            <div class="h-full rounded-full bg-app-text" :style="{ width: `${ratio * 100}%` }" />
          </div>
          <span
            class="pointer-events-none absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-app-text opacity-0 transition-opacity group-hover:opacity-100"
            :class="dragging && 'opacity-100'"
            :style="{ left: `${ratio * 100}%` }"
          />
        </div>

        <div class="mt-1 flex items-center justify-between text-[10px] tabular-nums text-app-text-faint">
          <span>{{ formatTime(elapsed) }}</span>
          <span>{{ formatTime(duration) }}</span>
        </div>

        <div class="mt-1.5 flex items-center justify-between">
          <button
            type="button"
            class="rounded-full p-1.5 transition-colors"
            :class="mode === 'list' ? 'text-app-text-faint hover:text-app-text' : 'text-app-text'"
            :aria-label="MODE_LABEL[mode]"
            :title="MODE_LABEL[mode]"
            @click="cycleMode"
          >
            <Icon :name="modeIcon" :size="16" />
          </button>

          <button
            type="button"
            class="rounded-full p-1.5 text-app-text transition-opacity hover:opacity-60"
            aria-label="上一首"
            @click="previous"
          >
            <Icon name="player-skip-back" :size="18" />
          </button>

          <button
            type="button"
            class="rounded-full p-1 text-app-text transition-opacity hover:opacity-60"
            :aria-label="playing ? '暂停' : '播放'"
            @click="toggle"
          >
            <Icon :name="playing ? 'player-pause' : 'player-play'" :size="22" />
          </button>

          <button
            type="button"
            class="rounded-full p-1.5 text-app-text transition-opacity hover:opacity-60"
            aria-label="下一首"
            @click="next"
          >
            <Icon name="player-skip-forward" :size="18" />
          </button>

          <button
            type="button"
            class="rounded-full p-1.5 transition-colors"
            :class="listOpen ? 'text-app-text' : 'text-app-text-faint hover:text-app-text'"
            :aria-expanded="listOpen"
            aria-label="播放列表"
            @click="listOpen = !listOpen"
          >
            <Icon name="playlist" :size="16" />
          </button>
        </div>

        <div
          class="grid transition-[grid-template-rows] duration-300 ease-out"
          :class="listOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'"
        >
          <div class="overflow-hidden">
            <ul class="mt-2.5 max-h-56 space-y-0.5 overflow-y-auto pr-1">
              <li v-for="(track, i) in tracks" :key="track.id">
                <button
                  type="button"
                  class="flex w-full items-center gap-2.5 rounded-xl p-1.5 text-left transition-colors hover:bg-app-bg-soft"
                  :class="i === index && 'bg-app-bg-soft'"
                  @click="select(i)"
                >
                  <img
                    v-if="track.cover"
                    :src="`${track.cover}?param=64y64`"
                    :alt="track.name"
                    class="size-7 shrink-0 rounded-md object-cover"
                    width="28"
                    height="28"
                    loading="lazy"
                  >
                  <span class="min-w-0 flex-1">
                    <span
                      class="block truncate text-[11px] font-medium"
                      :class="i === index ? 'text-app-primary-text' : 'text-app-text'"
                    >{{ track.name }}</span>
                    <span class="block truncate text-[10px] text-app-text-faint">{{ track.artists }}</span>
                  </span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </template>

      <p v-else-if="pending" class="mt-3 text-[11px] leading-5 text-app-text-faint">
        歌单加载中…
      </p>

      <p v-else-if="unavailable" class="mt-3 text-[11px] leading-5 text-app-text-faint">
        歌单暂时取不到，稍后再刷新看看。
      </p>
    </div>
  </component>
</template>
