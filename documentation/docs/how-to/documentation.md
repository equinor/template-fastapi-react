---
title: Documentation
---

Documentation
=============

This site was generated from the contents of your `docs` folder using Doctave and we host it on GitHub Pages.

## How it works

It boils down to having a documentation folder like `docs` with markdown files. The README.md acts as the start page. In the root of your repository, you need a file doctave.yml, containing at least a title. When you have the basics and Doctave installed, you can either `serve` or `build` the site.

This whole process is documented nicely on their [website](https://cli.doctave.com/tutorial).

## Publishing

We are using the Github Action  [`generate-docs.yaml`](../.github/workflows/generate-docs.yaml) to build and publish the documentation website.

This will checkout the code, install Doctave on the build agent, and build the documentation. Then it will deploy the documentation (placed in the site folder) to GitHub Pages.

## Initial settings

When deployed to GitHub Pages, you do need to configure your site under the settings. Pick the gh-pages branch and select either a private url or a public one. It will show you the site’s url, which should now contain your generated documentation site. Every change you make to your docs is built, and when run on main, it is deployed as well.

## Assets

All assets files are places under `docs/_include`

### PlantUML diagrams

From the root directory, just run to generate the diagrams locally:

```shell
plantuml -Djava.awt.headless=true -v -tsvg -r -o ../diagrams "docs/**.puml"
```