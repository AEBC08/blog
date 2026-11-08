export interface SidebarTerm {
  name: string
  count: number
}

export interface UseSidebarDataReturn {
  categories: ComputedRef<SidebarTerm[]>
  tags: ComputedRef<SidebarTerm[]>
}

function aggregate(values: Array<string | undefined>): SidebarTerm[] {
  const counts = new Map<string, number>()

  for (const value of values) {
    if (!value) {
      continue
    }
    counts.set(value, (counts.get(value) ?? 0) + 1)
  }

  return [
    ...counts.entries(),
  ]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
}

/**
 * Aggregates categories and tags from the published post list. Shares the
 * `blog-list` async data key with the list page, so no extra request is made.
 */
export async function useSidebarData(): Promise<UseSidebarDataReturn> {
  const { posts } = await useBlogList()

  const categories = computed(() => aggregate(posts.value.map(post => post.category)))
  const tags = computed(() => aggregate(posts.value.flatMap(post => post.tags ?? [])))

  return { categories, tags }
}
