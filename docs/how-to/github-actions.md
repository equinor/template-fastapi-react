---
title: Github actions
---

Github actions
=============

We use [GitHub Actions](https://docs.github.com/en/actions), as the [CI/CD pipeline](https://github.com/equinor/boilerplate-react-fastapi/actions).

GitHub Actions makes it easy to automate all our software workflows. It build, test, and deploy the code right from GitHub.

All the heavy lifting is done by GitHub. GitHub will simply use the files defined in `.github/workflows` to do the setup.

## Reusable workflows provided

A reusable workflow is just like any GitHub Actions workflow with one key difference: it includes a `workflow_call` trigger.

* The `release.yaml` workflow will automatically create a pull request with an auto-generated changelog everytime code is pushed to the main branch. It will also at the same time bump version with standard-version and create a tagged release that can be used to deploy to production.
  * Missing: How to deploy the project on a live system.

* The `tests.yaml` workflow will automatically run all types of tests.

* The `generate-docs.yaml` workflow will install Doctave on the build agent, and build the documentation. Then it will deploy the documentation (placed in the site folder) to GitHub Pages.

## Triggering reusable workflows

We trigger the reusable workflow like this:

![Github Actions](/diagrams/github-actions.svg)

This is work in progress (WIP). The release policy needs to be changed a bit. Since we are gone use trunk based development, all pushes to main needs to trigger a release to a test environment, and release to production (release.yaml) needs to be manually triggered. Also is the docker image creation missing.

