# Blog Project Memory

## Project Overview

Owen's personal blog built with Zola (custom fork in ./bin/zola). Chinese
default language, English via `*.en.md`.

## Key Paths

- `content/blog/` — all blog posts
- `scripts/` — Deno TypeScript utility scripts
- `config.toml` — main Zola config
- `.env` — secrets (gitignored)

## Jant Migration

Script: `scripts/migrate-to-jant.ts`

**Run command** (needs SSL bypass for local dev cert):

```bash
deno run --allow-all --unsafely-ignore-certificate-errors scripts/migrate-to-jant.ts
JANT_BASE_URL=https://jant.localtest.me deno run --allow-all --unsafely-ignore-certificate-errors scripts/migrate-to-jant.ts --all
JANT_BASE_URL=https://1-jant.localtest.me deno run --allow-all --unsafely-ignore-certificate-errors scripts/migrate-to-jant.ts --all
JANT_BASE_URL=https://2-jant.localtest.me deno run --allow-all --unsafely-ignore-certificate-errors scripts/migrate-to-jant.ts --all
JANT_BASE_URL=https://3-jant.localtest.me deno run --allow-all --unsafely-ignore-certificate-errors scripts/migrate-to-jant.ts --all
JANT_BASE_URL=https://4-jant.localtest.me deno run --allow-all --unsafely-ignore-certificate-errors scripts/migrate-to-jant.ts --all
JANT_BASE_URL=https://jant.owenyoung.com deno run --allow-all --unsafely-ignore-certificate-errors scripts/migrate-to-jant.ts --all
deno run --allow-all --unsafely-ignore-certificate-errors scripts/migrate-to-jant.ts --limit=10
deno run --allow-all --unsafely-ignore-certificate-errors scripts/migrate-to-jant.ts --dry-run
```

**API note:** Use `bodyMarkdown` (not `body` TipTap JSON) for post content.
Server handles markdown conversion. Images in body: upload via `/api/upload`,
replace URL in markdown. `<!--more-->` supported natively.

**Post type mapping:**

- `quotes/` → format=quote, no slug, no custom URL
- `links/` → format=link, slug=`blog-links-xxx`, custom URL
- `thoughts/` → format=note/thought, no slug, no custom URL
- everything else → format=note, slug=`blog-xxx`, custom URL

**Slug format:** `blog-{path-slugified}` e.g. `blog-books-12-rules-for-life`
**Custom URL path:** `blog/{original-path}` e.g. `blog/actionsflow` **State
file:** `temp-state.json` (gitignored via `temp*` rule) **API base:**
`https://jant.localtest.me` (override with JANT_BASE_URL env)
