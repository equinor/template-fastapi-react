# Documentation

This site was generated from the contents of your `docs` folder using [mkdocs](https://squidfunk.github.io/mkdocs-material/).

## Publishing

We are using the Github Action [`publish-docs.yaml`](https://github.com/equinor/template-fastapi-react/blob/main/.github/workflows/publish-docs.yaml) to build and publish the documentation website. This action is run every time someone pushes to the `main` branch.

This will checkout the code, build the documentation, and deploy it to GitHub Pages (from the `docs/site/` folder).

## Initial settings

When deployed to GitHub Pages, you do need to configure your site under the settings. Pick the gh-pages branch and select either a private url or a public one. It will show you the site’s url, which should now contain your generated documentation site.

## Assets

All asset images are places under `docs/docs/img`