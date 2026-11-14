<script setup lang="ts">
import { MiuixCard } from 'miuix-vue'

interface Track {
  id: number
  name: string
  artists: string
  cover: string
  /** Milliseconds, as returned by the API. */
  duration: number
}

interface PlaylistData {
  name: string
  cover: string
  tracks: Track[]
}

interface NeteaseTrack {
  id: number
  name: string
  duration: number
  artists?: { name: string }[]
  album?: { picUrl?: string }
}

interface NeteasePlaylist {
  result?: {
    name?: string
    coverImgUrl?: string
    tracks?: NeteaseTrack[]
  }
}

type PlayMode = 'list' | 'one' | 'shuffle'

const MODE_ICON: Record<PlayMode, string> = {
  list: 'repeat',
  one: 'repeat-once',
  shuffle: 'arrows-shuffle',
}

const appConfig = useAppConfig()
const playlistId = appConfig.music.playlistId

/** The API hands back `http://` covers; the page is https and must not regress. */
function toHttps(url?: string): string {
  return url
    ? url.replace(/^http:/, 'https:')
    : ''
}

/**
 * Official playlist endpoint, requested once at build time: the prerenderer
 * has network access, so no CORS proxy is needed and visitors get a static
 * payload. Track IDs are stable, which lets the browser build playback URLs
 * itself (see `source`) instead of calling the API at runtime.
 */
const { data: playlist } = await useAsyncData<PlaylistData | null>(
  `netease-playlist:${playlistId}`,
  async () => {
    try {
      const res = await $fetch<NeteasePlaylist>(
        `https://music.163.com/api/playlist/detail?id=${playlistId}`,
        {
          headers: { 'user-agent': 'Mozilla/5.0', 'referer': 'https://music.163.com/' },
          timeout: 10_000,
        },
      )
      const result = res.result

      if (!result?.tracks?.length) {
        return null
      }

      return {
        name: result.name ?? '歌单',
        cover: toHttps(result.coverImgUrl),
        tracks: result.tracks.map(track => ({
          id: track.id,
          name: track.name,
          artists: (track.artists ?? []).map(artist => artist.name).join(' / '),
          cover: toHttps(track.album?.picUrl),
          duration: track.duration,
        })),
      }
    }
    catch {
      return null
    }
  },
  {
    default: () => null,
  },
)

const tracks = computed(() => playlist.value?.tracks ?? [])

const audio = ref<HTMLAudioElement | null>(null)
const bar = ref<HTMLElement | null>(null)
const currentIndex = ref(0)
const playing = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const mode = ref<PlayMode>('list')
const listOpen = ref(false)
const dragging = ref(false)
const dragRatio = ref(0)
const notice = ref('')

const currentTrack = computed<Track | undefined>(() => tracks.value[currentIndex.value])

/** Legacy official redirect endpoint: `<audio>` follows it, no fetch needed. */
const source = computed(() => currentTrack.value
  ? `https://music.163.com/song/media/outer/url?id=${currentTrack.value.id}.mp3`
  : '')

const ratio = computed(() => {
  if (dragging.value) {
    return dragRatio.value
  }

  return duration.value > 0
    ? Math.min(1, currentTime.value / duration.value)
    : 0
})

const modeIcon = computed(() => MODE_ICON[mode.value])

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return '0:00'
  }

  const minutes = Math.floor(seconds / 60)
  const rest = Math.floor(seconds % 60)

  return `${minutes}:${String(rest).padStart(2, '0')}`
}

async function startPlayback(): Promise<void> {
  const el = audio.value

  if (!el) {
    return
  }

  try {
    await el.play()
  }
  catch {
    // Autoplay policies or an unavailable source; the error handler covers it.
  }
}

function togglePlay(): void {
  if (playing.value) {
    audio.value?.pause()
    return
  }

  void startPlayback()
}

async function selectTrack(index: number): Promise<void> {
  currentIndex.value = index
  currentTime.value = 0
  duration.value = (tracks.value[index]?.duration ?? 0) / 1000
  playing.value = true
  await nextTick()
  void startPlayback()
}

function next(): void {
  const total = tracks.value.length

  if (total === 0) {
    return
  }

  if (mode.value === 'shuffle' && total > 1) {
    let pick = currentIndex.value

    while (pick === currentIndex.value) {
      pick = Math.floor(Math.random() * total)
    }

    void selectTrack(pick)
    return
  }

  void selectTrack((currentIndex.value + 1) % total)
}

function previous(): void {
  const el = audio.value

  // Matches every other player: a tap after a few seconds restarts the track.
  if (el && el.currentTime > 3) {
    el.currentTime = 0
    return
  }

  const total = tracks.value.length

  if (total === 0) {
    return
  }

  void selectTrack((currentIndex.value - 1 + total) % total)
}

function cycleMode(): void {
  mode.value = mode.value === 'list'
    ? 'one'
    : mode.value === 'one'
      ? 'shuffle'
      : 'list'
}

function onTimeUpdate(event: Event): void {
  if (!dragging.value) {
    currentTime.value = (event.target as HTMLAudioElement).currentTime
  }
}

function onLoadedMetadata(event: Event): void {
  const el = event.target as HTMLAudioElement

  if (Number.isFinite(el.duration) && el.duration > 0) {
    duration.value = el.duration
  }
}

function onEnded(): void {
  if (mode.value === 'one') {
    const el = audio.value

    if (el) {
      el.currentTime = 0
      void startPlayback()
    }

    return
  }

  next()
}

/** Skips a broken source instead of retrying the same ID forever. */
function onError(): void {
  notice.value = '有曲目取不到，已自动跳过'
  const total = tracks.value.length

  if (total <= 1) {
    playing.value = false
    return
  }

  void selectTrack((currentIndex.value + 1) % total)
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

  const el = audio.value
  dragging.value = false

  if (!el || !Number.isFinite(el.duration)) {
    return
  }

  el.currentTime = dragRatio.value * el.duration
  currentTime.value = el.currentTime
}

function onSeekKey(event: KeyboardEvent): void {
  const el = audio.value

  if (!el) {
    return
  }

  if (event.key === 'ArrowLeft') {
    el.currentTime = Math.max(0, el.currentTime - 5)
    event.preventDefault()
  }
  else if (event.key === 'ArrowRight') {
    el.currentTime = Math.min(el.duration || 0, el.currentTime + 5)
    event.preventDefault()
  }
}
</script>

<template>
  <MiuixCard v-if="appConfig.music.enabled">
    <div class="p-4">
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
          <span>{{ formatTime(dragging ? dragRatio * duration : currentTime) }}</span>
          <span>{{ formatTime(duration) }}</span>
        </div>

        <div class="mt-1.5 flex items-center justify-between">
          <button
            type="button"
            class="rounded-full p-1.5 transition-colors"
            :class="mode === 'list' ? 'text-app-text-faint hover:text-app-text' : 'text-app-text'"
            :aria-label="mode === 'list' ? '列表循环' : mode === 'one' ? '单曲循环' : '随机播放'"
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
            @click="togglePlay"
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

        <p v-if="notice" class="mt-1 text-[10px] leading-4 text-app-text-faint">
          {{ notice }}
        </p>

        <div
          class="grid transition-[grid-template-rows] duration-300 ease-out"
          :class="listOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'"
        >
          <div class="overflow-hidden">
            <ul class="mt-2.5 max-h-56 space-y-0.5 overflow-y-auto pr-1">
              <li v-for="(track, index) in tracks" :key="track.id">
                <button
                  type="button"
                  class="flex w-full items-center gap-2.5 rounded-xl p-1.5 text-left transition-colors hover:bg-app-bg-soft"
                  :class="index === currentIndex && 'bg-app-bg-soft'"
                  @click="selectTrack(index)"
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
                      :class="index === currentIndex ? 'text-app-primary-text' : 'text-app-text'"
                    >{{ track.name }}</span>
                    <span class="block truncate text-[10px] text-app-text-faint">{{ track.artists }}</span>
                  </span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        <audio
          ref="audio"
          :src="source"
          preload="none"
          @play="playing = true"
          @pause="playing = false"
          @timeupdate="onTimeUpdate"
          @loadedmetadata="onLoadedMetadata"
          @ended="onEnded"
          @error="onError"
        />
      </template>

      <p v-else class="mt-3 text-[11px] leading-5 text-app-text-faint">
        歌单暂时取不到，稍后再刷新看看。
      </p>
    </div>
  </MiuixCard>
</template>
