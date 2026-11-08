<script setup lang="ts">
interface Props {
  /** Repository in `owner/name` form, e.g. `AEBC08/blog`. */
  repo: string
  description?: string
  /** Override the generated `https://github.com/<repo>` link. */
  href?: string
  /** API-sourced fields; every one of them can be switched off. */
  showLanguage?: boolean
  showStars?: boolean
  showForks?: boolean
  showLicense?: boolean
  /** Replace the GitHub glyph with the owner's avatar. */
  showAvatar?: boolean
  /** Override the generated `https://github.com/<owner>.png` avatar. */
  avatar?: string
  /** Fallbacks used when the API call fails (offline build, rate limit). */
  language?: string
  stars?: string | number
  forks?: string | number
  license?: string
}

interface RepoMeta {
  language: string | null
  stars: number
  forks: number
  license: string | null
  ownerAvatar: string | null
}

interface RepoApiResponse {
  language: string | null
  stargazers_count: number
  forks_count: number
  license: { spdx_id: string | null, name: string } | null
  owner: { avatar_url: string } | null
}

const props = withDefaults(defineProps<Props>(), {
  description: undefined,
  href: undefined,
  showLanguage: true,
  showStars: true,
  showForks: true,
  showLicense: true,
  showAvatar: false,
  avatar: undefined,
  language: undefined,
  stars: undefined,
  forks: undefined,
  license: undefined,
})

const link = computed(() => props.href ?? `https://github.com/${props.repo}`)
const owner = computed(() => props.repo.split('/')[0] ?? '')

// A token is optional: without it the anonymous limit is 60 requests/hour.
const token = import.meta.server
  ? useRuntimeConfig().githubToken
  : ''

/**
 * Star / fork / licence / language come from the GitHub API once, during
 * prerender: the values are serialised into the page payload, so visitors
 * never call the API and the card still renders when the request fails.
 */
const { data: meta } = await useAsyncData<RepoMeta | null>(
  `github-repo:${props.repo}`,
  async () => {
    try {
      const res = await $fetch<RepoApiResponse>(`https://api.github.com/repos/${props.repo}`, {
        headers: {
          'accept': 'application/vnd.github+json',
          'user-agent': 'mifumi-blog',
          ...(token
            ? { authorization: `Bearer ${token}` }
            : {}),
        },
        timeout: 10_000,
      })
      const spdx = res.license?.spdx_id

      return {
        language: res.language,
        stars: res.stargazers_count,
        forks: res.forks_count,
        license: spdx && spdx !== 'NOASSERTION'
          ? spdx
          : res.license?.name ?? null,
        ownerAvatar: res.owner?.avatar_url ?? null,
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

/** Numbers get thousands separators; pre-formatted strings pass through. */
function formatCount(value?: string | number | null): string | null {
  if (value === undefined || value === null) {
    return null
  }

  return typeof value === 'number'
    ? value.toLocaleString('en-US')
    : value
}

const languageLabel = computed(() => (props.showLanguage
  ? meta.value?.language ?? props.language
  : undefined))
const starLabel = computed(() => (props.showStars
  ? formatCount(meta.value?.stars ?? props.stars)
  : null))
const forkLabel = computed(() => (props.showForks
  ? formatCount(meta.value?.forks ?? props.forks)
  : null))
const licenseLabel = computed(() => (props.showLicense
  ? meta.value?.license ?? props.license
  : undefined))

const avatarSrc = computed(() => {
  if (!props.showAvatar) {
    return null
  }

  if (props.avatar) {
    return resolveCoverImage(props.avatar) ?? null
  }

  return meta.value?.ownerAvatar
    ?? (owner.value
      ? `https://github.com/${owner.value}.png?size=80`
      : null)
})
</script>

<template>
  <a
    :href="link"
    target="_blank"
    rel="noopener noreferrer"
    class="group my-6 block overflow-hidden rounded-2xl border border-app-divider bg-app-card transition-colors hover:border-app-primary/40"
  >
    <div class="flex items-center gap-3 border-b border-app-divider bg-app-bg-soft px-4 py-3">
      <img
        v-if="avatarSrc"
        :src="avatarSrc"
        :alt="props.repo"
        class="size-8 shrink-0 rounded-lg border border-app-divider object-cover"
        width="32"
        height="32"
      >
      <span v-else class="grid size-8 shrink-0 place-items-center rounded-lg bg-app-text text-app-card">
        <Icon name="brand-github" :size="18" />
      </span>
      <span class="min-w-0 flex-1">
        <span class="block truncate text-sm font-semibold text-app-text transition-colors group-hover:text-app-primary-text">
          {{ props.repo }}
        </span>
        <span class="block truncate text-[11px] text-app-text-faint">
          GitHub 仓库
        </span>
      </span>
      <Icon
        name="arrow-up-right"
        class="shrink-0 text-app-text-faint transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-app-primary-text"
        :size="16"
      />
    </div>

    <div class="px-4 py-3">
      <p v-if="props.description" class="text-sm leading-6 text-app-text-variant">
        {{ props.description }}
      </p>

      <div class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-app-text-faint">
        <span v-if="languageLabel" class="inline-flex items-center gap-1.5">
          <span class="size-2 rounded-full bg-app-primary" aria-hidden="true" />
          {{ languageLabel }}
        </span>

        <span v-if="starLabel" class="inline-flex items-center gap-1">
          <Icon name="star" :size="12" />
          {{ starLabel }}
        </span>

        <span v-if="forkLabel" class="inline-flex items-center gap-1">
          <Icon name="git-fork" :size="12" />
          {{ forkLabel }}
        </span>

        <span v-if="licenseLabel" class="inline-flex items-center gap-1">
          <Icon name="license" :size="12" />
          {{ licenseLabel }}
        </span>

        <span class="ml-auto inline-flex items-center gap-1">
          <Icon name="brand-github" :size="12" />
          查看仓库
        </span>
      </div>
    </div>
  </a>
</template>
