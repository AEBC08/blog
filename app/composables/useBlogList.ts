import type { BlogCollectionItem } from '@nuxt/content'

export type BlogListItem = Pick<
  BlogCollectionItem,
  'id' | 'path' | 'title' | 'description' | 'published' | 'tags' | 'category' | 'image' | 'layout'
>

export interface UseBlogListReturn {
  posts: ComputedRef<BlogListItem[]>
  pending: Ref<boolean>
  error: Ref<Error | undefined>
  refresh: () => Promise<void>
}

/**
 * Loads the published post list, newest first, with only the fields the list
 * UI needs. Drafts are filtered in SQL so they never reach the client payload.
 */
export async function useBlogList(): Promise<UseBlogListReturn> {
  const { data, pending, error, refresh } = await useAsyncData<BlogListItem[]>(
    'blog-list',
    () =>
      queryCollection('blog')
        .where('draft', '=', false)
        .order('published', 'DESC')
        .select('id', 'path', 'title', 'description', 'published', 'tags', 'category', 'image', 'layout')
        .all(),
    {
      default: () => [],
    },
  )

  return {
    posts: computed(() => data.value ?? []),
    pending,
    error,
    refresh: () => refresh(),
  }
}
