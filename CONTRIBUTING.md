# Contributing

Welcome! We are glad that you want to contribute to our project! 💖

This project accepts contributions via Github pull requests.

This document outlines the process to help get your contribution accepted.

There are many ways to contribute, from improving the documentation, submitting bug reports and feature requests or
writing code which can be incorporated into the template itself. 

## Ground Rules

A few general guidelines:

* For major changes, please open an issue first to discuss what you would like to change. 
  * Search for existing issues and pull requests on the [project development board]([](https://github.com/equinor/template-fastapi-react/projects/1)) before creating your own.
* Contributors should fork the repository and work on fixes or enhancements on their own fork.
  * Use the [pull request feature](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request-from-a-fork) to submit your changes to this  repository.
  * Please do not commit directly to master.
  * All pull requests should be rebased (with main) and commits squashed prior to the final merge process.
  * Use [conventional commit](https://www.conventionalcommits.org/en/v1.0.0/) formatting for commit messages, so that it's possible to auto-generate the changelogs.
  * Do not combine fixes for multiple issues into one branch. Use a separate branch for each issue you’re working on.
* Please include unit tests with all your code changes.
  * All unit tests must be 100% passing before the pull requests will be approved and merged.


## Getting Started

If you’d like to work on a pull request and you’ve never submitted code before, follow these steps:

1. Set up a local development environment. Please refer to
the [manual](https://equinor.github.io/template-fastapi-react/) for instructions on how to build, test, and run the template locally.
2. If you want to implement a breaking change or a change to the core, ensure there’s an issue that describes what you’re doing and the issue has been accepted. You can create a new issue or just indicate you’re working on an existing issue. Bug fixes, documentation changes, and other pull requests do not require an issue up-front.

After that, you’re ready working with code.

## Working with Code

We love pull requests and the process of submitting a pull request is fairly straightforward and generally follows the same pattern each time.

In general, we follow the ["fork-and-pull" Git workflow](https://github.com/susam/gitpr). 

Here's a quick guide:

1. Create your own fork of the repository 
2. Clone the project to your machine
3. To keep track of the original repository add another remote named upstream
```shell
git remote add upstream git@github.com:equinor/template-fastapi-react.git
```
4. Create a branch locally with a succinct but descriptive name. 
```shell
git checkout -b improve-feature
```
5. Make the changes in the created branch. 
6. Add and run tests for your changes (we only take pull requests with passing tests).
```shell
docker-compose run --rm api pytest
docker-compose run --rm web yarn test
```
7. Add the changed files 
```shell
git add path/to/filename
```
8. Commit your changes using
   the [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/) formatting for our commit messages. 
```shell
git commit -m "conventional commit formatted message"
```
9. Before you send the pull request, be sure to rebase onto the upstream source. This ensures your code is running on the latest available code.
```shell
git fetch upstream
git rebase upstream/main
```
10. Push to your fork.
```shell
git push origin improve-feature
```
11. Submit a pull request to the original repository (via Github interface). Please provide us with some explanation of why you made the changes you made. For new features make sure to explain a standard use case to us. 

That's it... thank you for your contribution!

After your pull request is merged, you can safely delete your branch. 

## Your First Contribution

You can start by looking through these beginner and help-wanted issues.

## How to report a bug

Report something that is broken or not working as
intended [here](https://github.com/equinor/template-fastapi-react/issues/new?assignees=&labels=type%3A+%3Abug+bug&template=bug-report.md&title=).

If you find a security vulnerability, do NOT open an issue, but contact us on email (one of the active contributors).

<!--- 
### Hotfixes
Branches can be created retroactively.

Create a branch from a release tag (or issue another release from the trunk).

Reproduce the bug on the trunk, fix it there with a test, watch that be verified by the CI server, then cherry-pick that to the release branch and wait for a CI server focusing on the release branch to verify it there too.

You should not fix bugs on the release branch. Well in case you forget to do that in the heat of the moment. Forgetting means a regression in production some weeks later.
--->

## How to suggest a feature or enhancement

Ideas for a new feature or enhancement are always welcome.

For new features, please open an issue first to discuss what you would like to
add [here](https://github.com/equinor/template-fastapi-react/issues/new?assignees=&labels=type%3A+%3Abulb%3A+feature+request&template=feature-request.md&title=).

For enhancements please open an issue first to discuss what you would like to
change [here](https://github.com/equinor/template-fastapi-react/issues/new?assignees=&labels=type%3A+%3Awrench%3A+maintenance&template=code-maintenance.md&title=).

## Code review process

The core team looks at pull requests on a regular basis. After feedback has been given we expect responses within three
weeks. After three weeks we may close the pull request if it isn't showing any activity.

## Pull Requests Guidelines

Please try to make your pull request easy to review for us.

* Make small pull requests. The smaller, the faster to review and the more likely it will be merged soon.
* Don't make changes unrelated to your PR. Maybe there are typos on some comments, maybe refactoring would be welcome on
  a function, but if that is not related to your PR, please make another PR for that.

While you're writing up the pull request, you can add Closes #XXX in the message body where #XXX is the issue you're fixing. Therefore, an example would be Closes #42 would close issue #42.

## Git Commit Guidelines

We have very precise rules over how our git commit messages can be formatted. 

We are using the [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/) formatting for commit messages.

Here’s an example commit message:

```
type: short description of what you did (imperative tense) <= 50 chars

When necessarry, mote details can come here, until 72 chars each line.

BREAKING CHANGE: some description

Fixes #1234
```

 This leads to more readable messages that are easy to follow when looking through the project history.

It is important to note that we use the git commit messages to auto-generate changelogs for each release.

## Trunk based development

We use trunk based development to speed up release cadences to get changes into customers hands faster.

* The main branch (shared trunk) should always be deployable.

* We release directly from a tag on the trunk and do not create a branch for a release.

* We push to our branch frequently, at least once per day.

* Make small changes to avoid long-lasting branches and avoid merge conflicts (as all developers work on the same branch).

* Do not to commit directly to the trunk instead one should create a feature branch (should not last for more than 1-3 days).

## Stylistic Guidelines

* For Python set up your editor to follow PEP 8 (remove trailing white space, no tabs, etc.). Check code with pyflakes / flake8.