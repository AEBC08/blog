<script setup lang="ts">
const {
  playlist,
  currentTrack,
  source,
  playing,
  time,
  duration,
  setAudio,
  load,
  play,
  pause,
  next,
  previous,
  seekTo,
  seekBy,
  onTimeUpdate,
  onLoadedMetadata,
  onPlay,
  onPause,
  onEnded,
  onError,
} = useMusicPlayer()

const el = ref<HTMLAudioElement | null>(null)

/** NetEase serves the same cover at any `?param=NyN` size. */
const ARTWORK_SIZES = [96, 192, 384]

/**
 * The OS media overlay (Windows SMTC, Chrome media hub, lock screen, headset
 * buttons) reads whatever the page puts into the Media Session API. Every call
 * is browser-gated because the API is optional.
 */
function session(): MediaSession | null {
  return typeof navigator !== 'undefined' && 'mediaSession' in navigator
    ? navigator.mediaSession
    : null
}

function setHandler(
  action: MediaSessionAction,
  handler: ((details: MediaSessionActionDetails) => void) | null,
): void {
  try {
    session()?.setActionHandler(action, handler)
  }
  catch {
    // This browser does not know the action; skipping it is fine.
  }
}

function syncMetadata(): void {
  const api = session()

  if (!api || typeof MediaMetadata === 'undefined') {
    return
  }

  const track = currentTrack.value

  if (!track) {
    api.metadata = null
    return
  }

  api.metadata = new MediaMetadata({
    title: track.name,
    artist: track.artists,
    album: playlist.value?.name ?? '',
    artwork: track.cover
      ? ARTWORK_SIZES.map(size => ({
          src: `${track.cover}?param=${size}y${size}`,
          sizes: `${size}x${size}`,
          type: 'image/jpeg',
        }))
      : [],
  })
}

function syncPosition(): void {
  const api = session()

  if (!api || typeof api.setPositionState !== 'function') {
    return
  }

  const total = duration.value

  if (!Number.isFinite(total) || total <= 0) {
    return
  }

  try {
    api.setPositionState({
      duration: total,
      position: Math.min(Math.max(time.value, 0), total),
      playbackRate: 1,
    })
  }
  catch {
    // Position can briefly exceed a freshly loaded duration; ignore.
  }
}

function bindHandlers(): void {
  setHandler('play', () => void play())
  setHandler('pause', () => pause())
  setHandler('stop', () => {
    pause()
    seekTo(0)
  })
  setHandler('previoustrack', () => previous())
  setHandler('nexttrack', () => next())
  setHandler('seekbackward', details => seekBy(-(details.seekOffset ?? 10)))
  setHandler('seekforward', details => seekBy(details.seekOffset ?? 10))
  setHandler('seekto', (details) => {
    if (typeof details.seekTime === 'number') {
      seekTo(details.seekTime)
    }
  })
}

const HANDLED_ACTIONS: MediaSessionAction[] = [
  'play',
  'pause',
  'stop',
  'previoustrack',
  'nexttrack',
  'seekbackward',
  'seekforward',
  'seekto',
]

function clearHandlers(): void {
  for (const action of HANDLED_ACTIONS) {
    setHandler(action, null)
  }
}

/** Coming back from offline is the most common reason the first load failed. */
function onOnline(): void {
  void load()
}

watch([
  currentTrack,
  () => playlist.value?.name,
], syncMetadata)
watch([time, duration], syncPosition)
watch(playing, (value) => {
  const api = session()

  if (api) {
    api.playbackState = value
      ? 'playing'
      : 'paused'
  }
})

onMounted(() => {
  setAudio(el.value)
  bindHandlers()
  syncMetadata()
  syncPosition()
  void load()
  window.addEventListener('online', onOnline)
})

onBeforeUnmount(() => {
  setAudio(null)
  clearHandlers()
  window.removeEventListener('online', onOnline)

  const api = session()

  if (api) {
    api.metadata = null
    api.playbackState = 'none'
  }
})
</script>

<template>
  <!-- One element for the whole site: it lives in the layout, so audio keeps
       playing while the route changes and both player surfaces share it. -->
  <audio
    ref="el"
    :src="source || undefined"
    preload="none"
    @timeupdate="onTimeUpdate"
    @loadedmetadata="onLoadedMetadata"
    @play="onPlay"
    @pause="onPause"
    @ended="onEnded"
    @error="onError"
  />
</template>
