# Ground rules

* For major changes, please open an issue first to discuss what you would like to change. 
  * Search for existing issues and pull requests on the [project development board](https://github.com/equinor/template-fastapi-react/projects/1) before creating your own.
* Contributors should fork the repository and work on fixes or enhancements on their own fork.
  * Use the [pull request feature](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request-from-a-fork) to submit your changes to this  repository.
  * All pull requests should be rebased (with main) and commits squashed prior to the final merge process.
  * Use [conventional commit](https://www.conventionalcommits.org/en/v1.0.0/) formatting for commit messages, so that it's possible to auto-generate the changelogs.
* Use a separate branch for each issue you’re working on. 
  * Do not combine fixes for multiple issues into one branch. 
* Please include unit tests with all your code changes.
  * All unit tests must be 100% passing before the pull requests will be approved and merged.
  
## Pull Requests

Please try to make your pull request easy to review for us.

* Make small pull requests. The smaller, the faster to review and the more likely it will be merged soon.
* Don't make changes unrelated to the goals of your PR. 
  * There might be typos on some comments, or perhaps a function is in need of refactoring - regardless, if those changes are not related to your PR, please implement those changes in another PR.

While you're writing up the pull request, you can add Closes #XXX in the message body where #XXX is the issue you're fixing. Therefore, an example would be Closes #42 would close issue #42.

## Git commit 

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

<!---
### Trunk based development

* The main branch should always be deployable.

* We release directly from the trunk and do not create a branch for a release.

* Do not to commit directly to the trunk instead one should create a short lived feature branch (should not last for more than 1-3 days).
-->
