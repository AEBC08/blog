/**
 * Resolves a frontmatter image path against the deployment base URL.
 * Absolute URLs and data URIs pass through unchanged.
 */
export function resolveCoverImage(image?: string): string | undefined {
  if (!image) {
    return undefined
  }

  if (/^(?:[a-z]+:)?\/\//i.test(image) || image.startsWith('data:')) {
    return image
  }

  const baseURL = useRuntimeConfig().app.baseURL.replace(/\/$/, '')
  const relativePath = image.startsWith('/')
    ? image.slice(1)
    : image

  return `${baseURL}/${relativePath}`
}
