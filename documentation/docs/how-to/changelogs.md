---
title: Changelogs
---

Changelogs
=============

We auto-generate changelogs by following the [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/). specification

## How to generate

### Auto-generated

 The Github action `release.yaml` is a workflow that will automatically create a pull request with an auto-generated changelog everytime code is pushed to the main branch.

### Locally

Sometimes it is nice to generate the changelogs locally for testing.

```shell
act -j release -s GITHUB_TOKEN=<GITHUB_TOKEN>
````

GITHUB_TOKEN: login to GitHub and generate a personal access token (PaT) from personal settings -> developer settings -> personal access tokens.