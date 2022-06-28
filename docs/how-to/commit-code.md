---
title: Commit code
---

Commit code
=============

You need to use [conventional commit](https://www.conventionalcommits.org/en/v1.0.0/) formatting for commit messages, so that it's possible to auto-generate the changelogs.

## Trunk-based development

We use trunk based development to speed up release cadences to get changes into customers hands faster.

![Trunk-based development](/diagrams/trunk-based-development.png)

The main branch (shared trunk) should always be deployable.

We release directly from a tag on the trunk and do not create a branch for a release.

We push to our branch frequently, at least once per day.

Make small changes to avoid long-lasting branches and avoid merge conflicts (as all developers work on the same branch).

Do not to commit directly to the trunk instead one should create a feature branch ( should not last for more than 1-3 days).

### To fix a bug or to enhance an existing code

Follow these steps:

* Create a new branch `git checkout -b improve-feature`
* Make the appropriate changes in the files (also write tests and documentation)
* Add the changed files `git add .`
* Commit you changes `git commit -m "conventional commit formated message`
* Push to the branch `git push origin improve-feature`
* Create a pull request with comprehensive description of changes

### Hotfixes

Branches can be created retroactively.

Create a branch from a release tag (or issue another release from the trunk).

Reproduce the bug on the trunk, fix it there with a test, watch that be verified by the CI server, then cherry-pick that to the release branch and wait for a CI server focusing on the release branch to verify it there too.

### Work in progress (WIP)

Features are merged into trunk, but are disabled via feature flags.

{% info :warning: You should not fix bugs on the release branch %}
Well in case you forget to do that in the heat of the moment. Forgetting means a regression in production some weeks later.
{% end %}


### Feature flags

This should be combined with feature flags.

As the trunk is always kept ready for release, feature flags help decouple deployment from release so any changes that are not ready can be wrapped in a feature flag and kept hidden while features that are complete can be released to end-users without delay.


