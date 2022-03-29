---
title: Nodejs Monorepo
date: 2022-03-26
updated: 2022-03-26
taxonomies:
  categories:
    - Dev
  tags:
    - Javascript
    - Nodejs
---

Use changesets as monorepo mananger.

<!-- more -->

## Tools

[GitHub - atlassian/changesets: 🦋 A way to manage your versioning and changelogs with a focus on monorepos](https://github.com/atlassian/changesets)

## Use Changesets as monorepo manager

### Init a monorepo

```bash
mkdir monorepo && cd monorepo
git init
# Add .gitignore file for nodejs <https://github.com/github/gitignore/blob/master/Node.gitignore>
npm init --yes
```

Add `"private":"true"` to the root `package.json`

```bash
npm init -w packages/a
npm init -w packages/b
npm init -w packages/c
```

Let `c` depends `a` and `b`,

Add

```json
"dependencies": {
  "a":"^1.0.0",
  "b":"^1.0.0"
}
```

to `packages/c/package.json`

### Install changesets

Also see [here](https://github.com/atlassian/changesets/blob/main/docs/intro-to-using-changesets.md)

```bash
npm install -D @changesets/cli && npx changeset init
```

This action will add a `.changeset` folder, and a couple of files to help you out:

You should change the `.changeset/config.json` -> `baseBranch` to yourself main branch, also change `access` to `public`

Commit current files.

```bash
git add .
git commit -m "feat: init"
```

That's done.

### Usage

#### First publish

First publish you should just use the follow command to publish your module

```bash
npx changeset publish
```

#### Future changes

You should see [changesets philosophy](https://github.com/atlassian/changesets/blob/main/docs/detailed-explanation.md)

You should first create an `intent to change`, that said, before what ever changes you want to make, you should create a `intent change`

```bash
npx changeset
```

...Make some changes

Now, generate new version, changeset will take care your dependences,

> Note, by default, if `a` upgrade from `1.0.1` to `1.0.2`, `c` depends on `a@^1.0.1`, then `c` `package.json` will not change, cause npm will auto update `a@^1.0.1` to the last version `1.0.2`
> if you want change to the exact version every time, you can set the config to
>
> ```bash
>  "___experimentalUnsafeOptions_WILL_CHANGE_IN_PATCH": {
>     "updateInternalDependents": "always"
>  }
> ```

```bash
npx changeset version
```

Then, you can publish it.

```bash
npx changeset publish
```

```bash
git add .
git commit -m "chore: version"
git push --follow-tags
```

## With CI

I'll use Github Actions as example.

The CI workflow assume that you use [开发技巧收藏](/content/dev-tips/index.md#git-tips) as your git workflow.

> Note, you can use [`@changesets/changelog-github`](https://github.com/atlassian/changesets/tree/main/packages/changelog-github) as your changelog format log. with this, you can generate a log like [this](https://github.com/theowenyoung/monorepo-example/releases/tag/%40theowenyoung%2Fpackage-example-b%401.1.0) , without this, then the log will only include [commit link](https://github.com/theowenyoung/monorepo-example/releases/tag/%40theowenyoung%2Fpackage-example-c%401.1.2) > `npm i -D @changesets/changelog-github`
>
> ```json
> {
>   "changelog": [
>     "@changesets/changelog-github",
>     { "repo": "theowenyoung/monorepo-example" }
>   ]
> }
> ```

1. Create a script in root `package.json`

```json
{
  "scripts": {
    "version-packages": "changeset version",
    "release": "changeset publish"
  }
}
```

2. Create github actions workflows

```bash
mkdir -p .github/workflows
```

```bash
touch .github/workflows/release.yml
```

With the following content:

```yaml
name: Release

on:
  workflow_dispatch:
  push:
    branches:
      - main

jobs:
  release:
    name: Release
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repo
        uses: actions/checkout@master
        with:
          # This makes Actions fetch all Git history so that Changesets can generate changelogs with the correct commits
          fetch-depth: 0

      - name: Setup Node.js 12.x
        uses: actions/setup-node@master
        with:
          node-version: 12.x
      - name: Setup NPM Latest
        run: npm i -g npm
      - name: Install Dependencies
        run: npm i

      - name: Create Release Pull Request or Publish to npm
        uses: changesets/action@master
        with:
          # this expects you to have a script called release which does a build for your packages and calls changeset publish
          publish: npm run release
          version: npm run version-packages
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

3. Add `NPM_TOKEN` to your github repo secret settings

By [开发技巧收藏](/content/dev-tips/index.md)

```bash
npm token create
```

Done.

Every time you use `npx changeset` to generate a new changeset intent, and the change is pulled to the `main` branch, then CI will create a pull request to generate a new version, and after the pull request was merged, CI will publish npm packages, and create a new release.

[//begin]: # "Autogenerated link references for markdown compatibility"
[git-workflows]: git-workflows.md "Git workflows"
[nodejs-tips]: nodejs-tips.md "Nodejs Tips"
[//end]: # "Autogenerated link references"
