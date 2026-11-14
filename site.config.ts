/**
 * 站点配置 —— 唯一数据源。
 *
 * 站点名称、描述、个人信息、导航、页脚与首页横幅都集中在这里：
 * - nuxt.config.ts 读取它生成 <head> 的 title / description / lang
 * - app/app.config.ts 把它交给 useAppConfig()，组件不再硬编码站点身份
 *
 * 改站点名、版权、页脚链接或首页文案，只需要动这个文件。
 */

export interface SiteLink {
  label: string
  href: string
  /** 图标名见 app/utils/icon-registry.ts */
  icon: string
}

/** 友链条目：头像留空时显示站点名首字母。 */
export interface FriendLink {
  name: string
  href: string
  avatar?: string
  description?: string
}

export const siteConfig = {
  /** 站点身份：浏览器标题、SEO、版权署名与 html lang 都读这里。 */
  site: {
    title: 'AEBC08',
    author: 'AEBC08',
    description: 'AEBC08 的个人博客，记录开发、工具与日常折腾。',
    tagline: '记录开发、工具与日常折腾。',
    url: 'https://aebc08.github.io/blog/',
    lang: 'zh-CN',
    titleSeparator: ' · ',
  },

  /** 侧边栏个人卡片与关于页的名片。 */
  profile: {
    name: 'AEBC08',
    bio: '在个人博客记录开发、工具与日常折腾。',
    avatar: '/covers/avatar.png',
    status: '正在更新博客',
    links: [
      {
        label: 'GitHub',
        href: 'https://github.com/AEBC08',
        icon: 'brand-github',
      },
      {
        label: '关于',
        href: '/about',
        icon: 'user',
      },
    ],
  },

  /** 顶部导航，顺序即显示顺序。 */
  navigation: [
    { label: '首页', to: '/' },
    { label: '文章', to: '/posts' },
    { label: '友链', to: '/friends' },
    { label: '关于', to: '/about' },
  ],

  /** 顶栏右侧图标链接，清空数组即可隐藏整组。 */
  header: {
    socialLinks: [
      {
        label: 'GitHub',
        href: 'https://github.com/AEBC08',
        icon: 'brand-github',
      },
    ],
  },

  /** 页脚：版权行、许可声明、技术栈链接与额外链接都可独立调整。 */
  footer: {
    showAvatar: true,
    /** 支持 {year} 与 {author} 占位符。 */
    copyright: '© {year} {author}',
    license: {
      prefix: '内容采用',
      label: 'CC BY-NC-SA 4.0',
      url: 'https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh-hans',
      suffix: '许可协议',
    },
    techLinks: [
      {
        label: 'Nuxt 4',
        href: 'https://nuxt.com',
        icon: 'brand-nuxt',
      },
      {
        label: 'Nuxt Content',
        href: 'https://content.nuxt.com',
        icon: 'miuix:File',
      },
      {
        label: 'miuix-vue',
        href: 'https://github.com/YuKongA/miuix-vue',
        icon: 'brand-vue',
      },
      {
        label: 'GitHub Pages',
        href: 'https://pages.github.com',
        icon: 'brand-github',
      },
    ],
    /** 备案号、友链等附加链接，留空即可。 */
    extraLinks: [] as SiteLink[],
  },

  /** 全局视觉动效：页面切换过渡、顶部滚动进度条与内容滚动渐显。 */
  effects: {
    /** 路由切换时旧页面淡出、新页面上浮进场（构建期读取）。 */
    pageTransition: true,
    /** 视口顶部 2px 阅读进度条，随页面滚动填充。 */
    scrollProgress: true,
    /** 文章卡片与侧边栏卡片进入视口时渐显上浮（JS 指令实现）。 */
    reveal: true,
  },

  /**
   * 评论：giscus（基于 GitHub Discussions，静态站免后端）。
   * 打开 https://giscus.app 按向导选择仓库后，把生成的四个参数填进来；
   * repoId / categoryId 留空时文章页不会渲染评论区。
   */
  comments: {
    enabled: true,
    giscus: {
      repo: 'AEBC08/blog',
      repoId: '',
      category: 'Announcements',
      categoryId: '',
      /** 按路径匹配讨论，可选 pathname / url / title 等。 */
      mapping: 'pathname',
      /** 是否展示 Discussions 的表情回应。 */
      reactions: true,
      /** 评论输入框位置：'top' 或 'bottom'。 */
      inputPosition: 'top',
    },
  },

  /**
   * 本站信息（友链页展示与复制）：想与站点默认信息不同时单独填写，
   * 留空的字段自动回退到 site / profile 的对应值。
   */
  siteInfo: {
    name: '',
    url: '',
    avatar: '',
    description: '',
  },

  /** 友链页（/friends）：数组为空时页面显示占位提示。 */
  friends: {
    /** 页面头部的一句说明。 */
    intro: '这里收录了朋友们的站点。想交换友链的话，欢迎通过「关于」页的联系方式联系我。',
    links: [
      // 示例条目，按需增删：
      // {
      //   name: '朋友的博客',
      //   href: 'https://example.com',
      //   avatar: 'https://example.com/avatar.png',
      //   description: '一句话介绍这个站点。',
      // },
    ] as FriendLink[],
  },

  /** 首页横幅：外观、文案、按钮、统计与动效，详见 README「首页横幅」。 */
  hero: {
    // auto 跟随站点明暗主题；light / dark 固定使用某一套配色。
    appearance: 'auto',
    // gradient = 组件绘制背景（装饰可单独动画）；image = 使用 public/banner*.svg 双色底图。
    background: 'gradient',
    decoration: {
      // 留空则继承 site.title，站点名只需改一处。
      brandLabel: '',
      brandMark: true,
      grid: true,
      monogram: true,
      accentBar: true,
      glow: true,
    },
    eyebrow: '个人博客',
    // 留空则分别继承 profile.name / site.tagline。
    title: '',
    titleSuffix: '.',
    tagline: '',
    showAvatar: true,
    actions: [
      {
        label: '开始阅读',
        to: '/posts',
        icon: 'arrow-right',
        variant: 'primary',
      },
      {
        label: '关于我',
        to: '/about',
        icon: 'user',
        variant: 'ghost',
      },
    ],
    stats: [
      {
        key: 'posts',
        label: '文章',
        icon: 'miuix:File',
        enabled: true,
      },
      {
        key: 'categories',
        label: '分类',
        icon: 'miuix:Folder',
        enabled: true,
      },
      {
        key: 'tags',
        label: '标签',
        icon: 'tag',
        enabled: true,
      },
    ],
    motion: {
      enabled: true,
      // subtle | standard | playful，作为 duration / stagger / distance 的整体倍率。
      preset: 'standard',
      duration: 0.6,
      stagger: 0.09,
      delay: 0.05,
      distance: 16,
      background: true,
      parallax: true,
      float: true,
      countUp: true,
      hover: true,
    },
  },
}
