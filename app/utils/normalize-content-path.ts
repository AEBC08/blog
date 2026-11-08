/**
 * Removes query/hash noise and trailing slashes, matching Nuxt Content paths.
 */
export function normalizeContentPath(path: string): string {
  const pathname = path.split(/[?#]/)[0] ?? '/'
  const withLeadingSlash = pathname.startsWith('/')
    ? pathname
    : `/${pathname}`
  const trimmed = withLeadingSlash.replace(/\/+$/, '')

  return trimmed || '/'
}
