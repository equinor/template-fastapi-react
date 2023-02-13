// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');
const simplePlantUML = require('@akebifiky/remark-simple-plantuml');

async function createConfig() {
  const mdxMermaid = await import('mdx-mermaid')
  return {
    title: 'Template FastAPI React',
    tagline: 'A solution template for creating a Single Page App (SPA) with React and FastAPI following the principles of Clean Architecture.',
    url: 'https://template-fastapi-react.app.playground.radix.equinor.com/',
    baseUrl: '/template-fastapi-react/',
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

    plugins: [

    ],

    presets: [
      [
        'classic',
        /** @type {import('@docusaurus/preset-classic').Options} */
        ({
          docs: {
            sidebarPath: require.resolve('./sidebars.js'),
            editUrl:
              'https://github.com/equinor/template-fastapi-react/tree/main/documentation/',
              remarkPlugins: [mdxMermaid.default, simplePlantUML],
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
              type: 'docSidebar',
              sidebarId: 'about',
              position: 'left',
              label: 'Docs',
            },
            {
              type: 'docSidebar',
              sidebarId: 'contribute',
              position: 'left',
              label: 'Contribute',
            },
            { to: '/docs/changelog', label: 'Changelog', position: 'left' },
            {
              href: 'https://template-fastapi-react.app.playground.radix.equinor.com',
              label: 'Demo',
              position: 'right',
            },
            {
              href: 'https://template-fastapi-react.app.playground.radix.equinor.com/api/docs',
              label: 'API',
              position: 'right',
            },
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
                  label: 'Docs',
                  to: '/docs/about/introduction',
                },
                  {
                  label: 'Contribute',
                  to: '/docs/contribute/how-to-start-contributing',
                },
                {
                  label: 'Changelog',
                  to: '/docs/changelog',
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
                {
                  label: 'Template FastAPI React',
                  href: 'https://template-fastapi-react.app.playground.radix.equinor.com/',
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
        colorMode: {
          defaultMode: 'dark',
          disableSwitch: false,
          respectPrefersColorScheme: true,
        }
      }),
  }
};

module.exports = createConfig;
