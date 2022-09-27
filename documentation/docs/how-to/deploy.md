---
title: Deploy
sidebar_position: 3
---

# Deployment

## Github actions

We use [GitHub Actions](https://docs.github.com/en/actions), as the [CI/CD pipeline](https://github.com/equinor/boilerplate-react-fastapi/actions).

GitHub Actions makes it easy to automate all our software workflows. It build, test, and deploy the code right from GitHub.

All the heavy lifting is done by GitHub. GitHub will simply use the files defined in `.github/workflows` to do the setup.

We trigger the reusable workflow like this:

![Github Actions](/img/github-actions.svg)


Since we are using trunk based development, all pushes to main trigger a release to a test environment.

Release to production is triggered when we merge inn the auto-generated pull requests (that contains changelog) that are created from the `release-please.yml` Github action. 

### Reusable workflows

A reusable workflow is just like any GitHub Actions workflow with one key difference, it includes a `workflow_call` trigger.

* The `release.yaml` workflow will automatically create a pull request with an auto-generated changelog everytime code is pushed to the main branch. It will also at the same time bump version with standard-version and create a tagged release that can be used to deploy to production.
  * Missing: How to deploy the project on a live system.

* The `tests.yaml` workflow will automatically run all types of tests.

* The `publish-docs.yaml` workflow will build the documentation. Then it will deploy the documentation (placed in the site folder) to GitHub Pages.
## Changelogs

We auto-generate changelogs by following the [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/). specification

### How to generate

#### Auto-generated

 The Github action `release-please.yaml` is a workflow that will automatically create a pull request with an auto-generated changelog everytime code is pushed to the main branch.

#### Locally

Sometimes it is nice to generate the changelogs locally for testing.

```shell
act -j release-please -s GITHUB_TOKEN=<GITHUB_TOKEN>
````

GITHUB_TOKEN: login to GitHub and generate a personal access token (PaT) from personal settings -> developer settings -> personal access tokens.
