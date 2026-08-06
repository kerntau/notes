import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: '序记',
  tagline: '个人知识库与博客记录',
  favicon: 'img/favicon.ico',
  headTags: [
    {
      tagName: 'link',
      attributes: {
        rel: 'apple-touch-icon',
        sizes: '180x180',
        href: '/img/apple-touch-icon.png',
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'manifest',
        href: '/img/site.webmanifest',
      },
    },
  ],

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set default language to Chinese (zh-Hans)
  i18n: {
    defaultLocale: 'zh-Hans',
    locales: ['zh-Hans'],
  },

  // Set the production url of your site here
  url: 'https://notes.curn.me',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  organizationName: 'kerntau',
  projectName: 'notes',

  onBrokenLinks: 'throw',

  themes: [
    [
      require.resolve('@easyops-cn/docusaurus-search-local'),
      {
        hashed: true,
        language: ['en', 'zh'],
        highlightSearchTermsOnTargetPage: true,
        explicitSearchResultPath: true,
        docsRouteBasePath: '/docs',
        indexBlog: false,
      },
    ],
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          showLastUpdateTime: true,
          editUrl:
            'https://github.com/kerntau/notes/tree/main/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    announcementBar: {
      id: 'welcome_announcement_1',
      content: '🎉 欢迎莅临小站 🥳',
      isCloseable: true,
    },
    colorMode: {
      respectPrefersColorScheme: true,
    },
    docs: {
      sidebar: {
        hideable: true,
        autoCollapseCategories: true,
      },
    },
    navbar: {
      hideOnScroll: true,
      title: '序记',
      logo: {
        alt: '序记 Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          to: '/docs/intro',
          label: '笔记',
          position: 'left',
          activeBaseRegex: '^/docs/(?!exam)',
        },
        {
          to: '/docs/exam/2025',
          label: '试题',
          position: 'left',
          activeBaseRegex: '^/docs/exam/',
        },
        {to: '/about', label: '关于', position: 'left'},
      ],
    },
    footer: {
      style: 'light',
      links: [],
      copyright: `<div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 16px; font-size: 0.8rem; line-height: 1;"><span>Copyright © ${new Date().getFullYear()} <span class="footer-site-title">序记</span></span><a href="https://docusaurus.io/" target="_blank" rel="noopener noreferrer" class="footer-link"><img src="/img/docusaurus-keytar.svg" alt="Docusaurus" /><span>基于 Docusaurus 构建</span></a><a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer" class="footer-link"><img src="/img/icp-beian.webp" alt="ICP备案" /><span>鄂ICP备2025157857号</span></a><a href="https://beian.mps.gov.cn/#/query/webSearch" target="_blank" rel="noopener noreferrer" class="footer-link"><img src="/img/gongan-beian.png" alt="公安备案" /><span>鄂公网安备 42018502008592号</span></a></div>`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
