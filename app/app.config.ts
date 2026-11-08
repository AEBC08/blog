export default defineAppConfig({
  site: {
    title: 'AEBC08',
    description: 'AEBC08 的个人博客，记录开发、工具与日常折腾。',
    tagline: '记录开发、工具与日常折腾。',
    author: 'AEBC08',
  },
  profile: {
    name: 'AEBC08',
    bio: '在个人博客记录开发、工具与日常折腾。',
    avatar: '/covers/avatar.jpg',
    status: '正在更新博客',
    links: [
      { label: 'GitHub', href: 'https://github.com/AEBC08', icon: 'brand-github' },
      { label: '关于', href: '/about', icon: 'user' },
    ],
  },
  // 友链写在 content/pages/about.md 里，用 LinkCard 组成，见 memory/content/009。
  navigation: [
    { label: '首页', to: '/' },
    { label: '文章', to: '/posts' },
    { label: '关于', to: '/about' },
  ],
})
