import type { BlogCollectionItem } from '@nuxt/content'

export interface UseBlogPostReturn {
  page: ComputedRef<BlogCollectionItem | null>
  pending: Ref<boolean>
}

/**
 * Loads a single post by route path. The path is normalised so that a trailing
 * slash (added by static hosting refreshes) still matches the stored path.
 * Missing or draft posts produce a 404.
 */
export async function useBlogPost(path?: string): Promise<UseBlogPostReturn> {
  const route = useRoute()
  const normalizedPath = normalizeContentPath(path ?? route.path)

  const { data, pending, error } = await useAsyncData<BlogCollectionItem | null>(
    `blog-post:${normalizedPath}`,
    async () => {
      const post = await queryCollection('blog').path(normalizedPath).first()

      if (!post || post.draft) {
        throw createError({ statusCode: 404, message: '文章不存在', fatal: true })
      }

      return post
    },
    {
      default: () => null,
    },
  )

  if (error.value) {
    throw createError({ statusCode: 404, message: '文章不存在', fatal: true })
  }

  return {
    page: computed(() => data.value),
    pending,
  }
}
