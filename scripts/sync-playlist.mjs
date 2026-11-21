#!/usr/bin/env node
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import process from 'node:process'

/**
 * Mirrors the official NetEase playlist endpoint into the JSON snapshot the
 * site serves from its own origin (`public/music/playlist.json`). Run by the
 * Pages deploy workflow before building; the browser never talks to NetEase or
 * a third-party CDN, which is what broke the cross-origin variants.
 */

const API = 'https://music.163.com/api/playlist/detail'
const TARGET = resolve(process.argv[2] ?? 'public/music/playlist.json')

/** The playlist id lives in site.config.ts; reading it keeps one source. */
async function readPlaylistId() {
  try {
    const config = await readFile(resolve('site.config.ts'), 'utf8')
    const match = config.match(/playlistId:\s*'([^']+)'/)

    return match?.[1] ?? process.env.MUSIC_PLAYLIST_ID ?? ''
  }
  catch {
    return process.env.MUSIC_PLAYLIST_ID ?? ''
  }
}

function toHttps(url) {
  return typeof url === 'string'
    ? url.replace(/^http:/, 'https:')
    : ''
}

function normalize(playlist) {
  return {
    name: playlist.name ?? '歌单',
    cover: toHttps(playlist.coverImgUrl),
    tracks: (playlist.tracks ?? []).map(track => ({
      id: track.id,
      name: track.name,
      artists: (track.artists ?? []).map(artist => artist.name).join(' / '),
      cover: toHttps(track.album?.picUrl),
      duration: track.duration,
    })),
  }
}

async function main() {
  const id = await readPlaylistId()

  if (!id) {
    throw new Error('找不到歌单 ID：检查 site.config.ts 的 music.playlistId')
  }

  const response = await fetch(`${API}?id=${id}`, {
    headers: {
      'user-agent': 'Mozilla/5.0',
      'referer': 'https://music.163.com/',
    },
  })

  if (!response.ok) {
    throw new Error(`接口返回 ${response.status}`)
  }

  const payload = await response.json()
  const playlist = payload?.result

  if (!playlist?.tracks?.length) {
    throw new Error('接口没有返回曲目，歌单可能被删除或设为私密')
  }

  const data = normalize(playlist)

  let previous = null

  try {
    previous = JSON.parse(await readFile(TARGET, 'utf8'))
  }
  catch {
    // First run or a bad file: just write a fresh snapshot.
  }

  if (previous && JSON.stringify(previous.tracks) === JSON.stringify(data.tracks)) {
    console.warn('歌单没有变化，跳过写入')
    return
  }

  await mkdir(dirname(TARGET), { recursive: true })
  await writeFile(
    TARGET,
    `${JSON.stringify({
      ...data,
      updatedAt: new Date().toISOString(),
    }, null, 2)}\n`,
    'utf8',
  )
  console.warn(`已写入 ${data.tracks.length} 首曲目 -> ${TARGET}`)
}

main().catch((error) => {
  console.error(error instanceof Error
    ? error.message
    : error)
  process.exit(1)
})
