# Owen's Blog

The blog is built with [Zola](https://www.getzola.org/), for my personal need, I've use [my forked version](https://github.com/theowenyoung/zola) to build it.

> The only change is that I use `/content/xxx.md` instead of `@/xxx.md` to refer the internal markdown files, so that the editor can also go to the linked file.

> [Related docments](https://www.getzola.org/documentation/content/linking/)
>
> [Related Issue 1](https://github.com/getzola/zola/issues/686)

[Visit it Online](https://www.owenyoung.com)

## Install

```bash
make install
```

## Local Serve

```bash
make serve
```

## Local Build

```bash
make build
```

## Usage

### Write

I use [Foam Lite](https://marketplace.visualstudio.com/items?itemName=theowenyoung.foam-lite-vscode) to help me input internal links quickly.

![](https://i.imgur.com/sYmKeKO.gif)

I also use [Simple bash to generate template markdown file for the initial blog post](/content/blog/generate-template-markdown-file-with-bash/index.en.md).

### Search

I use [Meilisearch](https://github.com/meilisearch/meilisearch) to index my blog, and I introduced it in [this article](https://www.owenyoung.com/blog/add-search/).

How to init the search? the install script is in my [dotfiles](https://github.com/theowenyoung/dotfiles):

```bash
./modules/meilisearch/install_meilisearch_debian.sh
ca meilisearch
```

Get the meilisear admin api key:

```bash
# TEMP_MEILISEARCH_API_KEY is the master key
curl \
  -X GET 'https://meilisearch.k3s.owenyoung.com/keys' \
  -H "Authorization: Bearer $TEMP_MEILISEARCH_API_KEY" \
  | json_pp
```

Then add the admin api key to [github actions secrets](https://github.com/theowenyoung/blog/settings/secrets/actions), then run [build site search index](https://github.com/theowenyoung/blog/actions/workflows/build-index-only.yml).

Then, change the `config.toml` -> `meilisearch_api_key` to the user search api key with the above result.

In the future, the [build workflow](https://github.com/theowenyoung/blog/blob/main/.github/workflows/build.yml) will take care of the search indexing automatically.
