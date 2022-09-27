# Documentation

This site was generated from the contents of your `documentation` folder using [Docusaurus](https://docusaurus.io/) and we host it on GitHub Pages.

## How it works

From Docusaurus own documentation:
> Docusaurus is a static-site generator. It builds a single-page application with fast client-side navigation, leveraging the full power of React to make your site interactive. It provides out-of-the-box documentation features but can be used to create any kind of site (personal website, product, blog, marketing landing pages, etc).

While Docusaurus is rich on features, we use it mostly to host markdown pages. The main bulk of the documentation is located in `documentation/docs`.

## Publishing

We are using the Github Action [`publish-docs.yaml`](https://github.com/equinor/template-fastapi-react/blob/main/.github/workflows/publish-docs.yaml) to build and publish the documentation website. This action is run every time someone pushes to the `main` branch.

This will checkout the code, download the changelog from the `generate-changelog.yaml` action, and build the documentation. Then it will deploy the documentation (placed in the documentation/build/ folder) to GitHub Pages.

## Initial settings

When deployed to GitHub Pages, you do need to configure your site under the settings. Pick the gh-pages branch and select either a private url or a public one. It will show you the site’s url, which should now contain your generated documentation site.

## Assets

All assets files are places under `documentation/static`
