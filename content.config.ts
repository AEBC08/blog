import { defineCollection, defineContentConfig, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    blog: defineCollection({
      type: 'page',
      source: 'posts/**/*.md',
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
    pages: defineCollection({
      type: 'page',
      source: 'pages/**/*.md',
      schema: z.object({
        description: z.string().optional(),
      }),
    }),
  },
})
