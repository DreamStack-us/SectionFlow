import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import remarkSnackPlayer from './plugins/remark-snackplayer/src/index';

const config: Config = {
  title: 'SectionFlow',
  tagline: 'High-performance section list for React Native with cell recycling',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  // GitHub Pages deployment
  url: 'https://dreamstack-us.github.io',
  baseUrl: '/SectionFlow/',
  organizationName: 'DreamStack-us',
  projectName: 'SectionFlow',
  trailingSlash: false,
  deploymentBranch: 'gh-pages',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  // Expo Snack integration
  scripts: [
    {
      src: 'https://snack.expo.dev/embed.js',
      async: true,
    },
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/DreamStack-us/SectionFlow/tree/main/docs/',
          remarkPlugins: [remarkSnackPlayer],
        },
        blog: false, // Disable blog
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/og-image.png',
    colorMode: {
      defaultMode: 'light',
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'SectionFlow',
      logo: {
        alt: 'SectionFlow Logo',
        src: 'img/logo.png',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Docs',
        },
        {
          to: '/docs/api/props',
          label: 'API',
          position: 'left',
        },
        {
          to: '/docs/examples/basic-list',
          label: 'Examples',
          position: 'left',
        },
        {
          href: 'https://github.com/DreamStack-us/SectionFlow',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Getting Started',
              to: '/docs/getting-started',
            },
            {
              label: 'API Reference',
              to: '/docs/api/props',
            },
          ],
        },
        {
          title: 'Examples',
          items: [
            {
              label: 'Basic List',
              to: '/docs/examples/basic-list',
            },
            {
              label: 'Sticky Headers',
              to: '/docs/examples/sticky-headers',
            },
            {
              label: 'Collapsible Sections',
              to: '/docs/examples/collapsible-sections',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/DreamStack-us/SectionFlow',
            },
            {
              label: 'npm',
              href: 'https://www.npmjs.com/package/sectionflow',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} DreamStack. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'typescript', 'tsx', 'json'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
