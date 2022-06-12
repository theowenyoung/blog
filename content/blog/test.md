---
title: test
date: 2022-06-13T05:30:56+08:00
updated: 2022-06-13
draft: false
taxonomies:
  categories:
    - Random
  tags:
    - test
---

```yaml
name: Denoflow
on:
  repository_dispatch:
  workflow_dispatch:
  # push:
  #   branches:
  #     - main
  schedule:
    - cron: "1 0 * * *"
jobs:
  denoflow:
        run: git config --global user.name "github-actions[bot]" && git config --global user.email github-actions-bot@users.noreply.github.com
      - name: git add
        run: git add data && git add sources
      - run: git status
      - id: isChanged
        run: git diff-index --cached --quiet HEAD || echo '::set-output name=changed::true'
      - name: Create pull request
        uses: peter-evans/create-pull-request@v3
        if: ${{ steps.isChanged.outputs.changed == 'true' }}

```
