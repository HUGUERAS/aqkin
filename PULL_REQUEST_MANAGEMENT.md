# Pull Request Management Guide

This document provides guidance on managing pull requests in this repository and identifying PRs that should be closed.

## Current Open Pull Requests

### PR #10 - Configure GitHub Copilot instructions and patch security vulnerabilities
- **Status**: DRAFT - Can be closed
- **Reason**: This PR was created by Copilot to set up instructions, but:
  1. The copilot instructions already exist in the main branch (`.github/copilot-instructions.md`)
  2. The security vulnerability fix (python-multipart upgrade) was already addressed
  3. This PR is marked as draft and has been superseded by existing work
- **Action**: Close this PR as the work has been completed through other means

### PR #3 - feat: auth, módulo financeiro, proteção de rotas, mapas Esri e script…
- **Status**: OPEN - Keep open for review
- **Reason**: This is an active feature PR from the repository owner that:
  1. Adds authentication and RBAC functionality
  2. Implements the finance module
  3. Adds map enhancements with Esri SDK
  4. Is marked as "clean" and mergeable
- **Action**: This PR should be reviewed and merged when ready

## How to Close Pull Requests

Since GitHub Copilot coding agent cannot directly close pull requests, you need to close them manually:

### Option 1: Via GitHub Web Interface
1. Go to the PR page: https://github.com/HUGUERAS/aqkin/pull/10
2. Scroll to the bottom of the page
3. Click the "Close pull request" button
4. Optionally add a comment explaining why it's being closed

### Option 2: Via GitHub CLI
```bash
gh pr close 10 --comment "Closing as work has been completed in main branch"
```

## Preventing Stale PRs

This repository now includes a workflow (`.github/workflows/stale-pr-detection.yml`) that:
- Automatically labels PRs as "stale" after 30 days of inactivity (with a warning comment)
- Closes stale PRs after an additional 60 days (90 days total inactivity)
- Helps maintain a clean PR list

## Best Practices

1. **Review regularly**: Check open PRs weekly
2. **Update or close**: If a PR cannot be completed, close it with an explanation
3. **Draft PRs**: Use draft status for work-in-progress that may not be completed
4. **Superseded work**: If work from a PR is completed elsewhere, close the original PR with a reference to where the work was completed

## Recommendations for PR #10

The Copilot instructions PR (#10) should be closed because:

1. **Copilot instructions exist**: The main branch already has comprehensive Copilot instructions at:
   - `.github/copilot-instructions.md`
   - `.github/instructions/testing.instructions.md`
   - `.github/instructions/frontend.instructions.md`
   - `.github/instructions/backend.instructions.md`

2. **Security fix applied**: The python-multipart dependency has been updated in the main branch

3. **Draft status**: The PR is marked as draft, indicating it was never finalized

To close it, run:
```bash
gh pr close 10 --comment "Closing: Copilot instructions already exist in main branch and security fix has been applied. Work completed through commit 0e842fc."
```
