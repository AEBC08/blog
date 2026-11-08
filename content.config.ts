import { defineCollection, defineContentConfig, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    blog: defineCollection({
      type: 'page',
      source: 'blog/**/*.md',
      schema: z.object({
        published: z.date(),
        description: z.string().optional(),
        tags: z.array(z.string()).default([]),
        category: z.string().optional(),
        draft: z.boolean().default(false),
        image: z.string().optional(),
        lang: z.string().optional(),
        layout: z.enum(['default', 'interactive']).default('default'),
      }),
    }),
  },
})
