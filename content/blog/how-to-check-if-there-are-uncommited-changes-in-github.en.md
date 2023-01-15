---
title: How to check if there are uncommited changes in Github Actions?
date: 2021-03-26
updated: 2022-03-26
taxonomies:
  categories:
    - Dev
  tags:
    - Git
---

Check if there are uncommited changes in Github Actions workflow file.

<!-- more -->

```yaml
name: Github Actions check if there are uncommited changes
on:
  repository_dispatch:
  workflow_dispatch:
  push:
    branches:
      - main
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Check out repository code
        uses: actions/checkout@v2
      - run: touch index.html
      - name: chown
        run: sudo chown -R $USER:$USER ./
      - name: git config
        run: git config --global user.name "github-actions[bot]" && git config --global user.email github-actions-bot@users.noreply.github.com
      - name: git add
        run: git add .
      - run: git status
      - id: isChanged
        run: git diff-index --cached --quiet HEAD || echo '::set-output name=changed::true'
      - run: echo ${{ steps.isChanged.outputs.changed }}
      - if: ${{ steps.isChanged.outputs.changed == 'true' }}
        run: echo 'yes, changed'
      - if: ${{ steps.isChanged.outputs.changed != 'true' }}
        run: echo 'no any change'
```
