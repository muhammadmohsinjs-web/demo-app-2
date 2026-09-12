# GitHub Actions Setup

This guide connects this demo repository to a separate analyzer repository.

When a pull request is opened:

1. GitHub checks out the changed code.
2. The analyzer reads the changes in `demo-commerce-app`.
3. The analyzer creates a Markdown report.
4. GitHub adds the report as a comment on the pull request.

## Before You Start

You need two GitHub repositories:

- This demo repository.
- Your analyzer repository: `hackathon-graphentra-analyzer`.

The analyzer repository should contain the code that examines file changes.

## Step 1: Turn The Analyzer Into An Action

In the root of the analyzer repository, create a file named `action.yml`:

```yaml
name: Graphentra Change Analyzer
description: Analyze files changed in a pull request

inputs:
  project-root:
    description: Directory containing the application
    required: true

  base-sha:
    description: Commit before the pull request changes
    required: true

  head-sha:
    description: Latest commit in the pull request
    required: true

  output-file:
    description: File where the Markdown report will be written
    required: false
    default: graphentra-report.md

runs:
  using: node24
  main: dist/index.js
```

Your analyzer must create the file provided by `output-file`. In this guide, that file is `graphentra-report.md`.

Example report:

```markdown
## Graphentra Change Analysis

Changed files: 2

- `demo-commerce-app/src/tax.ts`
- `demo-commerce-app/src/order.ts`

The tax change may affect order totals and checkout.
```

If the analyzer is written in JavaScript or TypeScript, bundle its code and dependencies into `dist/index.js`. Commit `dist/index.js` to the analyzer repository.

Commit and push the analyzer action:

```bash
git add action.yml dist package.json package-lock.json
git commit -m "Add GitHub Action"
git tag v1
git push origin main --tags
```

## Step 2: Allow Access To A Private Analyzer

Skip this step if the analyzer repository is public.

If it is private:

1. Open the analyzer repository on GitHub.
2. Select **Settings**.
3. Select **Actions**, then **General**.
4. Find the **Access** section.
5. Allow this demo repository to use the analyzer action.

The two private repositories normally need to belong to the same GitHub user or organization.

## Step 3: Add The Workflow To This Repository

At the root of this repository, create these directories:

```text
.github/workflows/
```

Create this file:

```text
.github/workflows/graphentra-analysis.yml
```

Do not put `.github` inside `demo-commerce-app`.

Add the following content:

```yaml
name: Graphentra PR Analysis

on:
  pull_request:
    types: [opened]

permissions:
  contents: read
  pull-requests: write

jobs:
  analyze:
    name: Analyze changed files
    runs-on: ubuntu-latest

    steps:
      - name: Check out the pull request
        uses: actions/checkout@v6
        with:
          ref: ${{ github.event.pull_request.head.sha }}
          fetch-depth: 0

      - name: Run the analyzer
        uses: YOUR_GITHUB_OWNER/hackathon-graphentra-analyzer@v1
        with:
          project-root: demo-commerce-app
          base-sha: ${{ github.event.pull_request.base.sha }}
          head-sha: ${{ github.event.pull_request.head.sha }}
          output-file: graphentra-report.md

      - name: Add the report to the pull request
        env:
          GH_TOKEN: ${{ github.token }}
          PR_URL: ${{ github.event.pull_request.html_url }}
        run: gh pr comment "$PR_URL" --body-file graphentra-report.md
```

Replace this value:

```yaml
uses: YOUR_GITHUB_OWNER/hackathon-graphentra-analyzer@v1
```

For example:

```yaml
uses: your-github-username/hackathon-graphentra-analyzer@v1
```

## Step 4: Enable GitHub Actions

In this demo repository:

1. Open **Settings** on GitHub.
2. Select **Actions**, then **General**.
3. Make sure GitHub Actions are enabled.
4. Make sure your analyzer action and `actions/checkout` are allowed.
5. Save the settings.

You do not need to create a `GITHUB_TOKEN` secret. GitHub creates it automatically.

## Step 5: Commit The Workflow

Run these commands from the root of this repository:

```bash
git add .github/workflows/graphentra-analysis.yml
git commit -m "Add Graphentra PR analysis"
git push
```

The workflow should be on the repository's default branch before you test it.

## Step 6: Test It

1. Create a new branch.
2. Change a file such as `demo-commerce-app/src/tax.ts`.
3. Commit and push the change.
4. Open a pull request on GitHub.
5. Open the repository's **Actions** tab.
6. Select the **Graphentra PR Analysis** run.
7. Wait for the run to finish.
8. Return to the pull request and look for the analyzer comment.

## Run Again When A PR Is Updated

The current workflow runs only when a pull request is first opened.

To also run it when new commits are pushed to the pull request, change:

```yaml
types: [opened]
```

to:

```yaml
types: [opened, synchronize, reopened]
```

This can create a new comment each time the pull request changes.

## Common Problems

### Workflow Does Not Start

Check that:

- The workflow is at `.github/workflows/graphentra-analysis.yml`.
- GitHub Actions are enabled.
- The workflow exists on the default branch.
- The file uses valid YAML indentation.

### Analyzer Action Cannot Be Found

Check that:

- `YOUR_GITHUB_OWNER` was replaced with the GitHub username or organization that owns `hackathon-graphentra-analyzer`.
- The analyzer has a `v1` tag.
- A private analyzer allows access from this repository.

### Report File Cannot Be Found

The analyzer must create this file before the comment step runs:

```text
graphentra-report.md
```

### Resource Not Accessible By Integration

The workflow does not have permission to comment on the pull request.

Check that the workflow contains:

```yaml
permissions:
  contents: read
  pull-requests: write
```

Pull requests from forks receive restricted permissions and may not be able to create comments. Do not use `pull_request_target` while checking out or running untrusted pull request code.

## Finished Structure

This demo repository should look like this:

```text
demo-app-2/
├── .github/
│   └── workflows/
│       └── graphentra-analysis.yml
├── demo-commerce-app/
├── GITHUB_ACTIONS_SETUP.md
└── README.md
```

The analyzer repository should look similar to this:

```text
hackathon-graphentra-analyzer/
├── action.yml
├── dist/
│   └── index.js
├── package.json
└── package-lock.json
```
