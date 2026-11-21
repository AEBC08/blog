export type PlayMode = 'list' | 'one' | 'shuffle'

export interface MusicTrack {
  id: number
  name: string
  artists: string
  cover: string
  /** Milliseconds. */
  duration: number
}

export interface MusicPlaylist {
  name: string
  cover: string
  tracks: MusicTrack[]
}

const MODE_ORDER: PlayMode[] = ['list', 'one', 'shuffle']

/**
 * The audio element lives in the layout, not in a widget, so playback keeps
 * running while the route changes and both surfaces (sidebar card and top bar
 * panel) control the same player. A module variable is enough: it only exists
 * in the browser and there is exactly one element.
 */
let audioEl: HTMLAudioElement | null = null

/**
 * Playlist data is fetched in the browser from a JSON snapshot served from the
 * site itself: the deploy workflow refreshes `public/music/playlist.json` from
 * the official NetEase endpoint before building. Same-origin means no CORS and
 * no third-party CDN, both of which turned out to be unreliable.
 */
export function useMusicPlayer() {
  const appConfig = useAppConfig()
  const runtimeConfig = useRuntimeConfig()

  const playlist = useState<MusicPlaylist | null>('music:playlist', () => null)
  const pending = useState('music:pending', () => false)
  const unavailable = useState('music:unavailable', () => false)
  const index = useState('music:index', () => 0)
  const playing = useState('music:playing', () => false)
  const time = useState('music:time', () => 0)
  const duration = useState('music:duration', () => 0)
  const mode = useState<PlayMode>('music:mode', () => 'list')

  const tracks = computed(() => playlist.value?.tracks ?? [])
  const currentTrack = computed<MusicTrack | undefined>(() => tracks.value[index.value])

  /** Official redirect endpoint; `<audio>` follows it, so no CORS is involved. */
  const source = computed(() => currentTrack.value
    ? `https://music.163.com/song/media/outer/url?id=${currentTrack.value.id}.mp3`
    : '')

  /**
   * Same-origin snapshot: prefix the site baseURL (the repo deploys under
   * `/blog/`) and bucket the query by the minute. The bucket costs nothing on a
   * 2 KB file and keeps a redeploy from hiding behind the Pages CDN.
   */
  function snapshotUrl(): string {
    const base = runtimeConfig.app.baseURL.endsWith('/')
      ? runtimeConfig.app.baseURL
      : `${runtimeConfig.app.baseURL}/`
    const path = appConfig.music.dataPath.replace(/^\//, '')

    return `${base}${path}?v=${Math.floor(Date.now() / 60_000)}`
  }

  async function load(force = false): Promise<void> {
    if (pending.value || (playlist.value && !force)) {
      return
    }

    pending.value = true
    unavailable.value = false

    try {
      const data = await $fetch<MusicPlaylist>(snapshotUrl(), {
        timeout: 15_000,
        cache: 'no-store',
      })

      if (data?.tracks?.length) {
        playlist.value = data

        if (index.value >= data.tracks.length) {
          index.value = 0
        }

        time.value = 0
        duration.value = (data.tracks[index.value]?.duration ?? 0) / 1000
      }
      else {
        unavailable.value = true
      }
    }
    catch {
      unavailable.value = true
    }
    finally {
      pending.value = false
    }
  }

  function setAudio(el: HTMLAudioElement | null): void {
    audioEl = el
  }

  async function play(): Promise<void> {
    if (!audioEl) {
      return
    }

    try {
      await audioEl.play()
    }
    catch {
      // Autoplay policy or a dead source; the error handler reports the latter.
    }
  }

  function pause(): void {
    audioEl?.pause()
  }

  function toggle(): void {
    if (playing.value) {
      pause()
      return
    }

    void play()
  }

  async function select(target: number): Promise<void> {
    index.value = target
    time.value = 0
    duration.value = (tracks.value[target]?.duration ?? 0) / 1000
    await nextTick()
    void play()
  }

  function next(): void {
    const total = tracks.value.length

    if (total === 0) {
      return
    }

    if (mode.value === 'shuffle' && total > 1) {
      let pick = index.value

      while (pick === index.value) {
        pick = Math.floor(Math.random() * total)
      }

      void select(pick)
      return
    }

    void select((index.value + 1) % total)
  }

  function previous(): void {
    // Same behaviour as every other player: restart first, then go back.
    if (audioEl && audioEl.currentTime > 3) {
      audioEl.currentTime = 0
      return
    }

    const total = tracks.value.length

    if (total === 0) {
      return
    }

    void select((index.value - 1 + total) % total)
  }

  function cycleMode(): void {
    const current = MODE_ORDER.indexOf(mode.value)
    mode.value = MODE_ORDER[(current + 1) % MODE_ORDER.length] ?? 'list'
  }

  /** Skips a broken source instead of retrying the same ID forever. */
  function skipBroken(): void {
    const total = tracks.value.length

    if (total <= 1) {
      playing.value = false
      return
    }

    void select((index.value + 1) % total)
  }

  function seek(ratio: number): void {
    if (!audioEl || !Number.isFinite(audioEl.duration) || audioEl.duration <= 0) {
      return
    }

    audioEl.currentTime = Math.min(1, Math.max(0, ratio)) * audioEl.duration
    time.value = audioEl.currentTime
  }

  function onTimeUpdate(event: Event): void {
    time.value = (event.target as HTMLAudioElement).currentTime
  }

  function onLoadedMetadata(event: Event): void {
    const el = event.target as HTMLAudioElement

    if (Number.isFinite(el.duration) && el.duration > 0) {
      duration.value = el.duration
    }
  }

  function onPlay(): void {
    playing.value = true
  }

  function onPause(): void {
    playing.value = false
  }

  function onEnded(): void {
    if (mode.value === 'one') {
      if (audioEl) {
        audioEl.currentTime = 0
        void play()
      }

      return
    }

    next()
  }

  return {
    playlist,
    tracks,
    currentTrack,
    source,
    index,
    playing,
    time,
    duration,
    mode,
    pending,
    unavailable,
    load,
    toggle,
    play,
    pause,
    next,
    previous,
    select,
    cycleMode,
    seek,
    setAudio,
    onTimeUpdate,
    onLoadedMetadata,
    onPlay,
    onPause,
    onEnded,
    onError: skipBroken,
  }
}
