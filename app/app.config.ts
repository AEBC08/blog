interface FriendLink {
  name: string
  href: string
  description: string
  icon?: string
}

const friends: FriendLink[] = []

export default defineAppConfig({
  site: {
    title: 'Mifumi',
    description: 'AEBC08 的个人博客，记录开发、工具与日常折腾。',
    tagline: '记录开发、工具与日常折腾。',
    author: 'AEBC08',
  },
  profile: {
    name: 'AEBC08',
    bio: '在 Mifumi 记录开发、工具与日常折腾。',
    avatar: '/covers/avatar.svg',
    status: '正在更新 Mifumi',
    links: [
      { label: 'GitHub', href: 'https://github.com/AEBC08', icon: 'brand-github' },
      { label: '关于', href: '/about', icon: 'user' },
    ],
  },
  friends,
  navigation: [
    { label: '首页', to: '/' },
    { label: '文章', to: '/posts' },
    { label: '关于', to: '/about' },
  ],
})
