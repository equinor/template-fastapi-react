# Contribution guide

Want to contribute to the template? There are a few things you need to know.

We wrote a [contribution guide](https://equinor.github.io/template-fastapi-react/docs/contribute/how-to-start-contributing) to help you get started.

Run `mise run lint:workflows` to audit GitHub Actions workflows locally with
zizmor. The dedicated zizmor workflow also audits pull requests and pushes to
`main`, uploading findings to GitHub code scanning.

Workflow concurrency groups use distinct names for reusable workflows to avoid
cancelling their callers. CI-only workflows cancel superseded runs; workflows
that publish, deploy, release, or roll back wait for the active run to finish.
