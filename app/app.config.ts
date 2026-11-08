export default defineAppConfig({
  site: {
    title: 'Miuix Blog',
    description: '一个使用 Nuxt 4、Nuxt Content 与 miuix-vue 构建的静态博客。',
    tagline: '写代码，也写关于代码的文字。',
    author: 'Miuix',
  },
  profile: {
    name: 'Miuix',
    bio: '写代码，也写关于代码的文字。',
    avatar: '/covers/avatar.svg',
    status: '正在写 Nuxt 与 miuix-vue',
    links: [
      { label: 'GitHub', href: 'https://github.com/', icon: 'brand-github' },
      { label: 'RSS', href: '/blog', icon: 'rss' },
    ],
  },
  navigation: [
    { label: '首页', to: '/' },
    { label: '文章', to: '/blog' },
    { label: '指南', to: '/blog/guide' },
  ],
})
