// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

async function createConfig() {
  const mdxMermaid = await import('mdx-mermaid')
  return {
    title: 'Template FastAPI React',
    tagline: 'Documentation for the FastAPI React Template',
    url: 'https://github.com/equinor/template-fastapi-react',
    baseUrl: '/',
    onBrokenLinks: 'throw',
    onBrokenMarkdownLinks: 'warn',
    favicon: 'img/favicon.png',

    // GitHub pages deployment config.
    // If you aren't using GitHub pages, you don't need these.
    organizationName: 'equinor', // Usually your GitHub org/user name.
    projectName: 'template-fastapi-react', // Usually your repo name.
    deploymentBranch: 'gh-pages',

    // Even if you don't use internalization, you can use this field to set useful
    // metadata like html lang. For example, if your site is Chinese, you may want
    // to replace "en" with "zh-Hans".
    i18n: {
      defaultLocale: 'en',
      locales: ['en'],
    },

    presets: [
      [
        'classic',
        /** @type {import('@docusaurus/preset-classic').Options} */
        ({
          docs: {
            sidebarPath: require.resolve('./sidebars.js'),
            editUrl:
              'https://github.com/equinor/template-fastapi-react/tree/main/documentation/',
              remarkPlugins: [mdxMermaid.default],
          },
          blog: false,
          theme: {
            customCss: require.resolve('./src/css/custom.css'),
          },
        }),
      ],
    ],

    themeConfig:
      /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
      ({
        navbar: {
          title: 'Template FastAPI React',
          logo: {
            alt: 'Equinor Logo',
            src: 'img/logo.svg',
          },
          items: [
            {
              type: 'doc',
              docId: 'intro',
              position: 'left',
              label: 'Tutorial',
            },
            {to: '/changelog', label: 'Changelog', position: 'left'},
            {
              href: 'https://github.com/equinor/template-fastapi-react',
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
                  label: 'Tutorial',
                  to: '/docs/intro',
                },
                {
                  label: 'Changelog',
                  to: '/changelog',
                },
              ],
            },
            {
              title: 'More',
              items: [
                {
                  label: 'Team Hermes Homepage',
                  href: 'https://verbose-eureka-374aa4f5.pages.github.io',
                },
                {
                  label: 'GitHub',
                  href: 'https://github.com/equinor/template-fastapi-react',
                },
              ],
            },
          ],
          copyright: `Copyright © ${new Date().getFullYear()} Team Hermes, Inc. Built with Docusaurus.`,
        },
        prism: {
          theme: lightCodeTheme,
          darkTheme: darkCodeTheme,
        },
      }),
  }
};

module.exports = createConfig;
