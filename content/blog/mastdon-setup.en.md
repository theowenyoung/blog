---
title: Mastdon Development Setup
date: 2022-03-26
updated: 2022-03-26
taxonomies:
  categories:
    - Dev
  tags:
    - Self-hosted
---

Also see [dev/setup](https://docs.joinmastodon.org/dev/setup/) [admin/install](https://docs.joinmastodon.org/admin/install/)

<!-- more -->

1. Install Ruby

[Installing Ruby](https://www.ruby-lang.org/en/documentation/installation/) 2. Install Node

See [nvm](https://github.com/nvm-sh/nvm)

3. Install postgres

[Postgres Setup for Debian](/content/blog/postgres-setup-for-debian.en.md)

4. Install redit

```bash
brew install redis
brew services start redis
```

5. Clone

```bash
git clone git@github.com:mastodon/mastodon.git live
```

6. Install ruby dependences

```bash
cd live
bundle config set --local with 'development'
bundle install
```

6. Install yarn

```bash
npm install --global yarn
```

7. Install nodejs dependences

```bash
yarn
```

1. Init database

```bash
RAILS_ENV=development bundle exec rails db:setup
```

8. Install foreman for multiple run

```bash
gem install foreman --no-document
```

9. Open

<http://localhost:3000>

email: `admin@localhost:3000`
password: `mastodonadmin`
