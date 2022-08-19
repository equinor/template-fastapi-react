---
title: Using Git
---

Using Git
=============

Git is used as version control system for the source code in the project.



## Basic principles
Whenever the devleoper makes any code changes, a new Pull Request (PR) should be created. The new PR should branch out from the main branch.
Ideally, each PR will do one thing (one new feature, fix one bug, etc). Keeping PRs small will simplify the code review process significantly. Also, a PR should be connected to an active issue from the project board.


Tip: on Github, if you write the syntax "closes #XXX" (XXX is the issue number) in the PR description, the connected issue will be automatically closed when the PR is merged.

When a branch (feature) is done, the developers create a PR and asks for review. When a PR is approved, the branch is merged to main. At least one person should approve the PR before merging to main. Merging will trigger the [github actions workflow](github-actions.md) which automatically tests and deploys.


## Branch naming
The branch should follow the naming structure:

```
<type>/<what-my-pr-does>
```
The type can be one of these types:
* feat: a feature
* fix: a bugfix
* build: a change to build system or external dependencies
* ci: a change to continous integration/delivery setup (typically scripts and config - files)
* docs: a changes to documentation
* style: a change to style 
* refactor: a code change that neither fixes a bug nor adds/removes a feature
* test: adding tests, refactoring test; no production code change
* chore: updating build tasks, package manager configs, etc; no production code change
* perf: a code change that improves performance

## Commits
Keep commit messages informative.
Here is a template for commit messages:

```
<type>(<optional scope>): imperative tense summary, <= 50 chars

When necessarry, mote details can come here, until 72 chars each line.

Refs/Resolves #<issue id>

BREAKING CHANGE: <description>
```

Also, remember to set up [Pre-commit](pre-commit.md).


## What to check before you send a PR to code review
* You use conventional commit messages
* Unit tests passes
* Other automatic tests passes, given it is feasible to execute them before code review 
* Naming conventions

## What to check in code reviews
* Functionality: Does the code behave as the PR author likely intended? Does the code behave as users would expect? If relevant, test the new feature manually on your local machine and try edge cases that might break the code.
* Software design: Is the code well-designed and fitted to the surrounding architecture?
* Complexity: Would another developer be able to easily understand and use the code?
* Tests: Does the PR have correct and well-designed automated tests?
* Naming: Are names for variables, functions, etc. descriptive?
* Comments: Are the comments clear and useful?
* Documentation: Did the author also update relevant documentation?
