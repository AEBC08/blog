import playlistSnapshot from '../../data/playlist.json'

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
  /** NetEase playlist id; falls back to `site.config.ts` when missing. */
  id?: number
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
 * The playlist is baked into the build: `data/playlist.json` is refreshed by the
 * deploy workflow right before `nuxt build`, so the card is part of the rendered
 * HTML and needs no runtime fetch. Editing a playlist costs one rebuild, which
 * the workflow only triggers when the snapshot actually changed.
 */
export function useMusicPlayer() {
  const appConfig = useAppConfig()

  const playlist = playlistSnapshot as MusicPlaylist
  const index = useState('music:index', () => 0)
  const playing = useState('music:playing', () => false)
  const time = useState('music:time', () => 0)
  const duration = useState('music:duration', () => (playlist.tracks[0]?.duration ?? 0) / 1000)
  const mode = useState<PlayMode>('music:mode', () => 'list')

  const tracks = computed(() => playlist.tracks)
  const currentTrack = computed<MusicTrack | undefined>(() => tracks.value[index.value])

  /** Official redirect endpoint; `<audio>` follows it, so no CORS is involved. */
  const source = computed(() => currentTrack.value
    ? `https://music.163.com/song/media/outer/url?id=${currentTrack.value.id}.mp3`
    : '')

  /** Mobile playlist page; the snapshot carries the id so config drift is safe. */
  const playlistUrl = computed(() => {
    const id = playlist.id ?? Number(appConfig.music.playlistId)

    return Number.isFinite(id) && id > 0
      ? `https://music.163.com/m/playlist?id=${id}`
      : ''
  })

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

  /** Absolute seek in seconds, used by the OS media controls. */
  function seekTo(seconds: number): void {
    if (!audioEl || !Number.isFinite(audioEl.duration) || audioEl.duration <= 0) {
      return
    }

    audioEl.currentTime = Math.min(audioEl.duration, Math.max(0, seconds))
    time.value = audioEl.currentTime
  }

  function seekBy(seconds: number): void {
    if (!audioEl) {
      return
    }

    seekTo(audioEl.currentTime + seconds)
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
    playlistUrl,
    index,
    playing,
    time,
    duration,
    mode,
    toggle,
    play,
    pause,
    next,
    previous,
    select,
    cycleMode,
    seek,
    seekTo,
    seekBy,
    setAudio,
    onTimeUpdate,
    onLoadedMetadata,
    onPlay,
    onPause,
    onEnded,
    onError: skipBroken,
  }
}
