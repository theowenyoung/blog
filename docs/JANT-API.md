# Jant API Reference

Jant exposes a compact HTTP API for automations, content migration, dashboard tooling, and hosted control-plane operations.

- Base URL: `https://your-site.com`
- Default format: JSON
- Timestamps: Unix seconds
- Auth: session cookies, Bearer API tokens, or an internal admin token for `/api/internal/*`

For static export and round-trip import, also see [Export and Import](export-and-import.md). For backup planning, see [Backups](backups.md).

`/api/auth/*` is handled by better-auth and is primarily intended for browser auth flows, so it is not covered here.

---

## API Surface

| Area                    | Base path                              | Auth                 |
| ----------------------- | -------------------------------------- | -------------------- |
| Public posts            | `/api/public/posts`                    | Public               |
| Posts                   | `/api/posts`                           | API token or session |
| Uploads (recommended)   | `/api/uploads`                         | API token or session |
| Uploads (legacy)        | `/api/upload`, `/api/upload/multipart` | API token or session |
| Text attachment content | `/api/attachments`                     | API token or session |
| MCP                     | `/api/mcp`                             | API token or session |
| Collections             | `/api/collections`                     | Mixed                |
| Navigation items        | `/api/nav-items`                       | Mixed                |
| Custom URLs             | `/api/custom-urls`                     | API token or session |
| Settings                | `/api/settings`                        | API token or session |
| Search                  | `/api/search`                          | Public               |
| Export                  | `/api/export`                          | API token or session |
| Internal admin          | `/api/internal/*`                      | Internal admin token |

Auth labels in this document:

- `Public`: no auth required
- `Session or token`: browser session cookie or `Authorization: Bearer <token>`
- `Internal admin token`: `Authorization: Bearer <INTERNAL_ADMIN_TOKEN>`

---

## Authentication

### API tokens

For scripts and integrations, create an API token in the dashboard:

1. Sign in to Jant.
2. Open `Settings -> API Tokens`.
3. Create a token and copy it immediately.

Use it as a Bearer token:

```bash
curl https://your-site.com/api/posts \
  -H "Authorization: Bearer jnt_YOUR_TOKEN"
```

API tokens grant the same API access as an authenticated dashboard session for the current site.

### Session cookies

Browser requests can use the normal dashboard session cookie after signing in at `/signin`.

### Local development token

When `DEV_API_TOKEN` is configured, Jant also accepts it as a Bearer token on local hosts only:

- `localhost`
- `127.0.0.1`
- `::1`
- `*.localtest.me`

This is meant for local tooling, not production clients.

### Internal admin token

`/api/internal/*` endpoints only accept the environment-provided `INTERNAL_ADMIN_TOKEN`.

If that token is not configured, those endpoints behave as if they do not exist and return `404`.

---

## Automation Entry Points

Jant exposes the same site-owner automation surface three ways:

- local `npx jant` commands when the automation runs on the site machine
- HTTP JSON endpoints under `/api/*`
- an authenticated MCP endpoint at `/api/mcp`

Projects created with `create-jant` also include `examples/agent-content-automation/README.md`, which shows copy-pasteable CLI and MCP flows for posts, media, and settings.

### Local CLI

The site-aware CLI maps directly to the HTTP endpoints documented below.

Available command groups:

- `npx jant posts`
- `npx jant media`
- `npx jant collections`
- `npx jant settings`
- `npx jant search`

Resolution rules:

- Pass `--url https://your-site.com`, or let the CLI read `SITE_ORIGIN` from the environment or `wrangler.toml`.
- Pass `--token jnt_...`, or set `JANT_API_TOKEN`.
- On local hosts only, `DEV_API_TOKEN` is also accepted.
- `npx jant collections list`, `npx jant collections get`, and `npx jant search` can call public endpoints without a token. Other commands require auth.

Examples:

```bash
npx jant posts create --input ./post.json
npx jant media upload ./cover.webp --alt "Cover image"
npx jant collections add-post col_01... pst_01...
npx jant settings update --json '{"SITE_NAME":"Quiet Notes"}'
npx jant search "quiet design"
```

### MCP

Base path: `/api/mcp`

Auth: `Session or token`

Jant's MCP endpoint is a minimal HTTP JSON-RPC transport for remote agents and automation systems that already speak MCP.

Current transport behavior:

- `POST` only
- content type `application/json`
- requires `MCP-Protocol-Version: 2025-06-18`
- supports `initialize`, `ping`, `tools/list`, `tools/call`, and `notifications/initialized`
- does not support batch requests, SSE streaming, or session negotiation

Current tool groups:

- posts: `jant_posts_list`, `jant_posts_get`, `jant_posts_get_content`, `jant_posts_create`, `jant_posts_update`, `jant_posts_delete`
- media: `jant_media_list`, `jant_media_get`, `jant_media_upload`, `jant_media_update_alt`, `jant_media_delete`
- attachments: `jant_attachments_get_content`
- collections: `jant_collections_list`, `jant_collections_get`, `jant_collections_create`, `jant_collections_update`, `jant_collections_delete`, `jant_collections_add_post`, `jant_collections_remove_post`
- settings: `jant_settings_get`, `jant_settings_update`
- search: `jant_search_posts`

Tool calls return normal MCP `result` envelopes. Successful tool calls include both `structuredContent` and a JSON string copy in `content[0].text`. Tool-level validation and domain failures return `200 OK` with `isError: true`.

Initialize:

```bash
curl -X POST https://your-site.com/api/mcp \
  -H "Authorization: Bearer jnt_YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -H "MCP-Protocol-Version: 2025-06-18" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18"}}'
```

Create a post through `tools/call`:

```bash
curl -X POST https://your-site.com/api/mcp \
  -H "Authorization: Bearer jnt_YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -H "MCP-Protocol-Version: 2025-06-18" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"jant_posts_create","arguments":{"format":"note","bodyMarkdown":"Created through MCP.","status":"published","visibility":"public"}}}'
```

---

## Conventions

### JSON and timestamps

Unless an endpoint explicitly returns a ZIP, XML, or plain text response, it returns JSON.

All timestamps are Unix seconds:

```json
{
  "createdAt": 1706000000
}
```

### IDs

Jant uses TypeIDs everywhere.

| Resource                  | Prefix | Example                          |
| ------------------------- | ------ | -------------------------------- |
| Post                      | `pst_` | `pst_01jpyx3m7gw4w3h7m4bknq0v1d` |
| Media / attachment        | `med_` | `med_01jpyx4g9m8b4y50a4gx3t7p1n` |
| Upload session            | `upl_` | `upl_01jpyx9h0m8w4g5q1c7d2f3r4s` |
| Collection                | `col_` | `col_01jpyx5qds8y79w2dd6sv4rznj` |
| Custom URL / path record  | `pth_` | `pth_01jpyxb27t6m4v9r2k8s5c1qfh` |
| Collection directory item | `cdi_` | `cdi_01jpyx8r7s3v8m1q5c9k2f6gth` |
| Nav item                  | `nav_` | `nav_01jpyxcv3m7w4b8k2r5s9t1qfh` |

Invalid IDs return `400`.

### Slugs, paths, and aliases

- Post and collection `slug` values are lowercase `a-z`, `0-9`, and `-`.
- Post `path` is a create-time convenience field, not a general path-management API.
- If a post `path` is itself a valid slug, Jant uses it as the canonical slug.
- If a post `path` is not a valid slug, Jant slugifies it for the canonical URL and stores the original path as an alias.
- Custom URL creation expects a leading slash in the request body, but list/create responses return normalized paths without the leading slash.

### Body formats

Posts accept content in one of two mutually exclusive fields:

- `bodyMarkdown`: recommended for scripts and migrations
- `body`: a TipTap JSON string, mainly for editor integrations

Jant renders stored content into:

- `bodyHtml`
- `bodyText`

Markdown support includes headings, lists, links, images, tables, fenced code blocks, blockquotes, and `<!--more-->` excerpt breaks.

Line breaks follow standard Markdown rules:

- A single newline stays within the same paragraph.
- A blank line starts a new paragraph.
- Use two trailing spaces or a backslash before the newline to create a hard line break.

### Quote post field mapping

Quote posts use quote-specific names in the API:

- Send `sourceName` and `sourceUrl` in requests.
- Quote responses return `sourceName` and `sourceUrl`.
- Quote responses do not expose `title` or `url`.

---

## Error Format

Domain errors use this shape:

```json
{
  "error": "Human-readable message",
  "code": "VALIDATION_ERROR",
  "details": {}
}
```

- `details` is present for validation errors that carry structured field information.
- Unhandled server errors may return only `{ "error": "Something went wrong on our end" }`.

Common error codes:

| Code                     | HTTP  | Meaning                                                             |
| ------------------------ | ----- | ------------------------------------------------------------------- |
| `VALIDATION_ERROR`       | `400` | Invalid input, invalid ID, unsupported field combination            |
| `UNAUTHORIZED`           | `401` | Missing or invalid auth                                             |
| `FORBIDDEN`              | `403` | Authenticated but not allowed                                       |
| `NOT_FOUND`              | `404` | Resource does not exist                                             |
| `CONFLICT`               | `409` | Duplicate slug/path, invalid state transition, hosted-mode conflict |
| `MEDIA_QUOTA_EXCEEDED`   | `409` | Hosted media quota would be exceeded                                |
| `RATE_LIMIT`             | `429` | Too many requests                                                   |
| `CONFIGURATION_ERROR`    | `500` | Missing or invalid server configuration                             |
| `EXTERNAL_SERVICE_ERROR` | `500` | External dependency failed                                          |

Example validation error:

```json
{
  "error": "Provide either body or bodyMarkdown, not both",
  "code": "VALIDATION_ERROR",
  "details": {
    "formErrors": [],
    "fieldErrors": {
      "bodyMarkdown": ["Provide either body or bodyMarkdown, not both"]
    }
  }
}
```

---

## Posts

Base path: `/api/posts`

Jant supports three post formats:

| Format  | Purpose          | Required fields |
| ------- | ---------------- | --------------- |
| `note`  | Original writing | none            |
| `link`  | Shared reference | `title`, `url`  |
| `quote` | Quoted text      | `quoteText`     |

Post responses include these fields:

| Field            | Type                                     | Notes                                                     |
| ---------------- | ---------------------------------------- | --------------------------------------------------------- |
| `id`             | `pst_*` string                           | Post ID                                                   |
| `siteId`         | string                                   | Owning site                                               |
| `format`         | `note` \| `link` \| `quote`              | Post format                                               |
| `status`         | `draft` \| `published`                   | Stored post status                                        |
| `visibility`     | `public` \| `latest_hidden` \| `private` | Resolved visibility shown to clients                      |
| `pinnedAt`       | integer \| `null`                        | Pin timestamp                                             |
| `featuredAt`     | integer \| `null`                        | Feature timestamp                                         |
| `slug`           | string                                   | Canonical slug                                            |
| `title`          | string \| `null`                         | Returned for non-quote responses; omitted for `quote`     |
| `url`            | string \| `null`                         | Returned for non-quote responses; usually `null` on notes |
| `sourceName`     | string \| `null`                         | Returned instead of `title` for `quote`                   |
| `sourceUrl`      | string \| `null`                         | Returned instead of `url` for `quote`                     |
| `body`           | string \| `null`                         | Raw TipTap JSON string when stored that way               |
| `bodyHtml`       | string \| `null`                         | Rendered HTML                                             |
| `bodyText`       | string \| `null`                         | Plain-text rendering                                      |
| `quoteText`      | string \| `null`                         | Quote content                                             |
| `summary`        | string \| `null`                         | Optional summary                                          |
| `rating`         | integer \| `null`                        | `1` to `5` when set                                       |
| `replyToId`      | `pst_*` string \| `null`                 | Parent reply/post ID                                      |
| `threadId`       | `pst_*` string                           | Thread root ID                                            |
| `deletedAt`      | integer \| `null`                        | Soft-delete timestamp                                     |
| `publishedAt`    | integer \| `null`                        | Publish timestamp                                         |
| `lastActivityAt` | integer                                  | Last activity timestamp                                   |
| `createdAt`      | integer                                  | Unix seconds                                              |
| `updatedAt`      | integer                                  | Unix seconds                                              |
| `attachments`    | array                                    | Ordered media/text attachment objects                     |
| `collectionIds`  | `col_*` string[]                         | Only included by `GET /api/posts/:id`                     |

### Post response shape

The post list and detail endpoints return the same core fields. `GET /api/posts/:id` additionally includes `collectionIds`.

Example:

```json
{
  "id": "pst_01jpyx3m7gw4w3h7m4bknq0v1d",
  "siteId": "sit_01jpyx1v6z9k4c7b2m5q8r3nfh",
  "format": "note",
  "status": "published",
  "visibility": "public",
  "pinnedAt": null,
  "featuredAt": null,
  "slug": "hello-world",
  "title": "Hello World",
  "body": null,
  "bodyHtml": "<p>Hello world</p>",
  "bodyText": "Hello world",
  "quoteText": null,
  "summary": null,
  "rating": null,
  "replyToId": null,
  "threadId": "pst_01jpyx3m7gw4w3h7m4bknq0v1d",
  "deletedAt": null,
  "publishedAt": 1706000000,
  "lastActivityAt": 1706000000,
  "createdAt": 1706000000,
  "updatedAt": 1706000000,
  "attachments": []
}
```

Notes:

- Quote posts replace `title` and `url` with `sourceName` and `sourceUrl`.
- Quote responses omit `title` and `url` instead of returning them as `null`.
- `replyToId !== null` means the post is a thread reply.
- `threadId` points at the thread root.
- `GET /api/posts` includes both root posts and replies. There is currently no `excludeReplies` query parameter.

## Public posts

Base path: `/api/public/posts`

These endpoints expose the public reading view, not the dashboard editing view.

Public post responses include these fields:

| Field             | Type                        | Notes                                                          |
| ----------------- | --------------------------- | -------------------------------------------------------------- |
| `id`              | `pst_*` string              | Post ID                                                        |
| `format`          | `note` \| `link` \| `quote` | Post format                                                    |
| `status`          | `published`                 | Public endpoints only return published posts                   |
| `visibility`      | `public` \| `latest_hidden` | List excludes `latest_hidden`; single-post reads may return it |
| `slug`            | string                      | Canonical slug                                                 |
| `permalink`       | string                      | Public post URL                                                |
| `title`           | string \| `null`            | Returned for `note` and `link` posts                           |
| `url`             | string \| `null`            | Returned for `link` posts                                      |
| `sourceName`      | string \| `null`            | Returned instead of `title` for `quote`                        |
| `sourceUrl`       | string \| `null`            | Returned instead of `url` for `quote`                          |
| `bodyHtml`        | string \| `null`            | Rendered HTML; omitted when `content=markdown`                 |
| `bodyText`        | string \| `null`            | Plain-text rendering; omitted when `content=markdown`          |
| `bodyMarkdown`    | string \| `null`            | Markdown source; only returned when `content=markdown`         |
| `quoteText`       | string \| `null`            | Quote content                                                  |
| `summary`         | string \| `null`            | Optional summary                                               |
| `rating`          | integer \| `null`           | `1` to `5` when set                                            |
| `previewKind`     | string \| `null`            | Link preview kind                                              |
| `previewProvider` | string \| `null`            | Link preview provider                                          |
| `previewImageUrl` | string \| `null`            | Public preview image URL                                       |
| `replyToId`       | `pst_*` string \| `null`    | Parent reply/post ID                                           |
| `threadId`        | `pst_*` string              | Thread root ID                                                 |
| `pinnedAt`        | integer \| `null`           | Pin timestamp                                                  |
| `featuredAt`      | integer \| `null`           | Feature timestamp                                              |
| `publishedAt`     | integer \| `null`           | Publish timestamp                                              |
| `lastActivityAt`  | integer                     | Last activity timestamp                                        |
| `createdAt`       | integer                     | Unix seconds                                                   |
| `updatedAt`       | integer                     | Unix seconds                                                   |
| `attachments`     | array                       | Ordered media/text attachment objects                          |
| `collections`     | object[]                    | Public collection refs with `id`, `slug`, `title`, and `url`   |

### List public posts

`GET /api/public/posts`

Auth: `Public`

Query parameters:

| Parameter    | Type                                  | Required | Default              | Notes                                                                                               |
| ------------ | ------------------------------------- | -------- | -------------------- | --------------------------------------------------------------------------------------------------- |
| `format`     | `note` \| `link` \| `quote`           | no       | all                  | Format filter                                                                                       |
| `collection` | string                                | no       | none                 | Filter by collection slug(s). Single slug (`design`) or multiple comma-separated (`tech,art`)       |
| `sort`       | `newest` \| `oldest` \| `rating_desc` | no       | collection's default | Sort order override. Only effective when `collection` is set. Without `collection`, this is ignored |
| `cursor`     | string                                | no       | none                 | Pass the previous `nextCursor` back unchanged                                                       |
| `limit`      | integer                               | no       | `20`                 | `1` to `100`                                                                                        |
| `content`    | `markdown`                            | no       | none                 | Return `bodyMarkdown` instead of rendered body fields                                               |

Collection filtering notes:

- Single collection: `?collection=design`
- Multiple collections (union): `?collection=tech,art`
- When filtering by a single collection, results default to that collection's configured `sortOrder`.
- When filtering by multiple collections, results default to `newest`.
- Use `sort` to override the default: `?collection=design&sort=oldest`
- If any slug in the `collection` parameter does not resolve, the endpoint returns an empty result set.

Response:

```json
{
  "posts": [
    {
      "id": "pst_01jpyx3m7gw4w3h7m4bknq0v1d",
      "format": "note",
      "status": "published",
      "visibility": "public",
      "slug": "hello-world",
      "permalink": "/hello-world",
      "title": "Hello World",
      "bodyHtml": "<p>Hello world</p>",
      "bodyText": "Hello world",
      "quoteText": null,
      "replyToId": null,
      "threadId": "pst_01jpyx3m7gw4w3h7m4bknq0v1d",
      "publishedAt": 1706000000,
      "attachments": [],
      "collections": []
    }
  ],
  "nextCursor": "pst_01jpyx3m7gw4w3h7m4bknq0v1d"
}
```

Notes:

- This list returns published public thread roots only.
- Drafts, private posts, replies, and `latest_hidden` posts are excluded.
- `content=markdown` returns `bodyMarkdown` and omits `bodyHtml/bodyText`.

### Get a public post by slug

`GET /api/public/posts/:slug`

Auth: `Public`

This returns a single published public post by canonical slug.

Notes:

- `latest_hidden` posts remain readable by direct slug.
- Draft and private posts return `404`.
- `content=markdown` returns `bodyMarkdown` and omits `bodyHtml/bodyText`.

### List posts

`GET /api/posts`

Auth: `Session or token`

Query parameters:

| Parameter | Type                        | Required | Default     | Notes                                         |
| --------- | --------------------------- | -------- | ----------- | --------------------------------------------- |
| `format`  | `note` \| `link` \| `quote` | no       | all         | Format filter                                 |
| `status`  | `draft` \| `published`      | no       | `published` | Status filter                                 |
| `cursor`  | string                      | no       | none        | Pass the previous `nextCursor` back unchanged |
| `limit`   | integer                     | no       | `100`       | `1` to `100`                                  |

Response:

```json
{
  "posts": [
    {
      "id": "pst_01jpyx3m7gw4w3h7m4bknq0v1d",
      "format": "note",
      "status": "published",
      "visibility": "public",
      "slug": "hello-world",
      "title": "Hello World",
      "bodyHtml": "<p>Hello world</p>",
      "bodyText": "Hello world",
      "quoteText": null,
      "replyToId": null,
      "threadId": "pst_01jpyx3m7gw4w3h7m4bknq0v1d",
      "publishedAt": 1706000000,
      "createdAt": 1706000000,
      "updatedAt": 1706000000,
      "attachments": []
    }
  ],
  "nextCursor": "pst_01jpyx3m7gw4w3h7m4bknq0v1d"
}
```

Notes:

- Each item uses the post response fields above, except list responses omit `collectionIds`.
- `nextCursor` is `null` when there are no more results.

### Suggest or validate a slug

`GET /api/posts/slug`

Auth: `Session or token`

Query parameters:

| Parameter | Type           | Required | Notes                                                |
| --------- | -------------- | -------- | ---------------------------------------------------- |
| `mode`    | `suggest`      | yes      | Suggest a slug from `title`                          |
| `title`   | string         | suggest  | Source title used for slug suggestion                |
| `postId`  | `pst_*` string | no       | Exclude the current post when suggesting or checking |
| `mode`    | `check`        | yes      | Check whether a specific slug is available           |
| `slug`    | string         | check    | Lowercase slug candidate to validate and check       |

Modes:

- Suggest from a title:

```text
GET /api/posts/slug?mode=suggest&title=Hello%20World
```

Response:

```json
{ "slug": "hello-world" }
```

- Check availability:

```text
GET /api/posts/slug?mode=check&slug=hello-world
```

Response:

```json
{
  "slug": "hello-world",
  "available": true
}
```

When editing an existing post, pass `postId` so the current slug counts as available:

```text
GET /api/posts/slug?mode=check&slug=hello-world&postId=pst_...
```

Invalid slug candidates return `400`, including reserved slugs and slugs with invalid characters.

### Get a single post

`GET /api/posts/:id`

Auth: `Session or token`

This returns the full post plus `collectionIds` and ordered `attachments`.

Example:

```json
{
  "id": "pst_01jpyx3m7gw4w3h7m4bknq0v1d",
  "format": "note",
  "collectionIds": ["col_01jpyx5qds8y79w2dd6sv4rznj"],
  "attachments": [],
  "slug": "hello-world",
  "title": "Hello World",
  "bodyHtml": "<p>Hello world</p>",
  "bodyText": "Hello world"
}
```

### Create a post

`POST /api/posts`

Auth: `Session or token`

Request body:

```json
{
  "format": "quote",
  "quoteText": "What stands in the way becomes the way.",
  "sourceName": "Marcus Aurelius",
  "sourceUrl": "https://example.com/meditations",
  "bodyMarkdown": "Still one of the clearest lines in the book.",
  "status": "published",
  "visibility": "public",
  "publishedAt": 1706000000,
  "slug": "from-marcus-aurelius",
  "collectionIds": ["col_01jpyx5qds8y79w2dd6sv4rznj"],
  "attachments": [
    { "type": "media", "mediaId": "med_01jpyx4g9m8b4y50a4gx3t7p1n" },
    {
      "type": "text",
      "contentFormat": "markdown",
      "content": "# Attached note\n\nExtra context here."
    }
  ]
}
```

Fields:

| Field           | Type                                     | Required             | Default        | Notes                                                                     |
| --------------- | ---------------------------------------- | -------------------- | -------------- | ------------------------------------------------------------------------- |
| `format`        | `note` \| `link` \| `quote`              | yes                  | —              | Post format                                                               |
| `title`         | string                                   | required for `link`  | —              | Max `300`; not allowed for `quote`                                        |
| `sourceName`    | string                                   | no                   | `null`         | Quote attribution name, max `300`; only for `quote`                       |
| `body`          | string                                   | no                   | `null`         | TipTap JSON string; mutually exclusive with `bodyMarkdown`                |
| `bodyMarkdown`  | string                                   | no                   | `null`         | Recommended for scripts; mutually exclusive with `body`                   |
| `slug`          | string                                   | no                   | auto-generated | Canonical slug; mutually exclusive with `path`                            |
| `path`          | string                                   | no                   | —              | Create-time path helper; mutually exclusive with `slug`                   |
| `status`        | `draft` \| `published`                   | no                   | `published`    | Post status                                                               |
| `visibility`    | `public` \| `latest_hidden` \| `private` | no                   | `public`       | Post visibility                                                           |
| `pinned`        | boolean                                  | no                   | `false`        | Pin the post; not allowed on replies                                      |
| `featured`      | boolean                                  | no                   | `false`        | Mark as featured                                                          |
| `url`           | absolute URL                             | required for `link`  | —              | Allows `http:`, `https:`, or `mailto:`; not allowed for `note` or `quote` |
| `sourceUrl`     | absolute URL                             | no                   | `null`         | Quote attribution URL; not allowed for non-quote                          |
| `quoteText`     | string                                   | required for `quote` | —              | Not allowed for `note` or `link`                                          |
| `rating`        | integer                                  | no                   | `null`         | `1` to `5`; send `0` to clear on update                                   |
| `collectionIds` | `col_*` string[]                         | no                   | `[]`           | Collection TypeIDs; max `20`                                              |
| `replyToId`     | `pst_*` string                           | no                   | `null`         | Make this post a thread reply                                             |
| `publishedAt`   | integer                                  | no                   | current time   | Unix seconds; only valid when `status` is `published`                     |
| `attachments`   | attachment[]                             | no                   | `[]`           | Ordered attachments, max `20`                                             |

Important rules:

- Use `body` or `bodyMarkdown`, not both.
- Use `slug` or `path`, not both.
- `path` is only available on create. Post updates only support `slug`.
- `link` posts require `title` and `url`.
- `quote` posts require `quoteText` and must use `sourceName` / `sourceUrl` instead of `title` / `url`.
- `note` posts do not accept `url`, `quoteText`, `sourceName`, or `sourceUrl`.
- Replies cannot be pinned.
- Replies inherit thread visibility.
- Replies inherit the root status unless you explicitly create the reply as `draft`.

Path behavior:

- `path: "hello-world"` creates the post at `/hello-world`.
- `path: "2024/01/hello-world"` creates a slugified canonical URL such as `/2024-01-hello-world` and stores `/2024/01/hello-world` as an alias.

Response: `201 Created` with the full post object and ordered `attachments`.

### Attachments

Posts accept an ordered `attachments` array. Order in the request is the order shown on the post.

Input shapes:

- Media attachment:

```json
{ "type": "media", "mediaId": "med_...", "alt": "Optional alt text" }
```

- Text attachment:

```json
{
  "type": "text",
  "contentFormat": "markdown",
  "content": "# Heading",
  "summary": "Optional summary"
}
```

Fields:

| Field           | Type           | Required | Default | Notes                                  |
| --------------- | -------------- | -------- | ------- | -------------------------------------- |
| `type`          | `"media"`      | yes      | —       | Media attachment                       |
| `mediaId`       | `med_*` string | yes      | —       | Previously uploaded media ID           |
| `alt`           | string         | no       | `null`  | Alt text, max `500`                    |
| `type`          | `"text"`       | yes      | —       | Text attachment                        |
| `contentFormat` | `"markdown"`   | yes      | —       | Currently only `markdown` is supported |
| `content`       | string         | yes      | —       | Non-empty text content                 |
| `summary`       | string         | no       | `null`  | Optional summary, max `300`            |

Response shapes:

- Media attachment:

```json
{
  "type": "media",
  "id": "med_...",
  "url": "/media/med_....jpg",
  "previewUrl": "/media/med_....jpg",
  "posterUrl": null,
  "alt": null,
  "blurhash": null,
  "width": 800,
  "height": 600,
  "mimeType": "image/jpeg",
  "originalName": "photo.jpg",
  "size": 1024000,
  "summary": null,
  "chars": null
}
```

- Text attachment:

```json
{
  "type": "text",
  "id": "med_...",
  "contentFormat": "markdown",
  "contentUrl": "/api/attachments/med_.../content",
  "summary": "Attached note Extra context here.",
  "chars": 33
}
```

### Get text attachment content

`GET /api/attachments/:id/content`

Auth: `Session or token`

This only works for `type: "text"` attachments.

Response:

```json
{
  "id": "med_01jpyx7c0s7y5v2m4b8g1f9qkr",
  "type": "text",
  "contentFormat": "markdown",
  "content": "# Attached note\n\nExtra context here.",
  "summary": "Attached note Extra context here.",
  "chars": 33
}
```

### Update a post

`PUT /api/posts/:id`

Auth: `Session or token`

This is a partial update. Omitted fields stay unchanged.

Example:

```json
{
  "sourceName": "Epictetus",
  "sourceUrl": "https://example.com/discourses",
  "bodyMarkdown": "Updated commentary in **Markdown**."
}
```

Request body fields:

This endpoint accepts the same JSON fields as `POST /api/posts`, except `path`. All fields are optional. Additionally, update accepts `null` to clear `title`, `sourceName`, `body`, `bodyMarkdown`, `url`, `sourceUrl`, `quoteText`, and `rating`.

Attachment replacement rules:

- Omit `attachments`: keep existing attachments
- Send `"attachments": []`: remove all attachments
- Send a new `attachments` array: replace all attachments in that order

Notes:

- `path` is not supported on update. Use `slug` for canonical URL changes and `custom-urls` for extra aliases.
- For quote posts, keep using `sourceName` and `sourceUrl`.
- Thread replies reject direct `visibility` and `pinned` changes.
- Draft updates cannot set `publishedAt`.
- To clear a rating, send `0`.

Response: `200 OK` with the updated post.

### Delete a post

`DELETE /api/posts/:id`

Auth: `Session or token`

Deletes the post. If the target is a thread root, its replies are deleted as part of the same operation.

Response:

```json
{ "success": true }
```

---

## Uploads

All upload endpoints require auth.

Jant currently exposes three upload APIs:

1. `/api/uploads`: recommended session-based upload API for new clients
2. `/api/upload`: legacy single-request upload API
3. `/api/upload/multipart`: legacy explicit multipart relay API

File size is limited by `UPLOAD_MAX_FILE_SIZE_MB` and defaults to `500 MB`.

Jant accepts a broad set of image, video, audio, document, text, archive, font, design, and code MIME types. Unsupported types return `400`.

### Recommended upload flow

Base path: `/api/uploads`

Use this flow for new integrations:

1. `POST /api/uploads/init`
2. Upload the file using the returned transport
3. Optionally upload a poster image for video
4. `POST /api/uploads/:id/complete`

Upload sessions expire after roughly 15 minutes.

### Start an upload session

`POST /api/uploads/init`

Request body:

```json
{
  "filename": "photo.webp",
  "contentType": "image/webp",
  "size": 1024000,
  "checksumSha256": "base64-encoded-sha256"
}
```

Fields:

| Field            | Type    | Required | Default | Notes                           |
| ---------------- | ------- | -------- | ------- | ------------------------------- |
| `filename`       | string  | yes      | —       | Original filename               |
| `contentType`    | string  | yes      | —       | MIME type                       |
| `size`           | integer | yes      | —       | File size in bytes              |
| `checksumSha256` | string  | no       | `null`  | Base64-encoded SHA-256 checksum |

The response includes an upload session ID (`upl_*`) and one of three transport kinds.

#### Relay transport

```json
{
  "id": "upl_01jpyx9h0m8w4g5q1c7d2f3r4s",
  "transport": {
    "kind": "relay",
    "method": "PUT",
    "url": "/api/uploads/upl_01jpyx9h0m8w4g5q1c7d2f3r4s/body"
  }
}
```

#### Multipart relay transport

```json
{
  "id": "upl_01jpyx9h0m8w4g5q1c7d2f3r4s",
  "transport": {
    "kind": "multipartRelay",
    "method": "PUT",
    "url": "/api/uploads/upl_01jpyx9h0m8w4g5q1c7d2f3r4s/part",
    "partSize": 52428800
  }
}
```

#### Presigned PUT transport

When the storage driver supports direct uploads, Jant can return a presigned target instead:

```json
{
  "id": "upl_01jpyx9h0m8w4g5q1c7d2f3r4s",
  "transport": {
    "kind": "put",
    "url": "https://uploads.example.test/...",
    "method": "PUT",
    "headers": {
      "Content-Type": "image/webp",
      "Cache-Control": "public, max-age=31536000, immutable"
    },
    "expiresAt": 1706000900
  }
}
```

### Upload the file body

Use the transport returned by `init`.

For `relay`:

`PUT /api/uploads/:id/body`

- Body: raw file bytes
- Success response: `204 No Content`

For `multipartRelay`:

`PUT /api/uploads/:id/part?partNumber=N`

- Body: raw part bytes
- Success response:

```json
{
  "partNumber": 1,
  "etag": "etag-value"
}
```

For `put`:

- Upload directly to the returned `transport.url`
- Use the returned HTTP method and headers unchanged

### Upload a poster image

`PUT /api/uploads/:id/poster`

Use this when uploading a video and you want a WebP poster frame.

- Body: raw WebP bytes
- Success response: `204 No Content`

### Complete an upload session

`POST /api/uploads/:id/complete`

Request body:

```json
{
  "width": 1200,
  "height": 800,
  "blurhash": "LEHV6nWB2yk8pyo0adR*.7kCMdnj",
  "waveform": "optional-waveform",
  "summary": "Optional summary for text uploads",
  "chars": 123,
  "parts": [
    { "partNumber": 1, "etag": "etag-1" },
    { "partNumber": 2, "etag": "etag-2" }
  ]
}
```

Fields:

| Field      | Type    | Required                      | Default | Notes                                 |
| ---------- | ------- | ----------------------------- | ------- | ------------------------------------- |
| `width`    | integer | no                            | `null`  | Image/video width; positive           |
| `height`   | integer | no                            | `null`  | Image/video height; positive          |
| `blurhash` | string  | no                            | `null`  | Blurhash string, max `200`            |
| `waveform` | string  | no                            | `null`  | Audio waveform, max `2000`            |
| `summary`  | string  | no                            | `null`  | Mainly for text uploads, max `500`    |
| `chars`    | integer | no                            | `null`  | Mainly for text uploads; non-negative |
| `parts`    | array   | required for `multipartRelay` | —       | `[{partNumber, etag}]`                |

Response:

```json
{
  "id": "med_01jpyx4g9m8b4y50a4gx3t7p1n",
  "filename": "med_01jpyx4g9m8b4y50a4gx3t7p1n.webp",
  "url": "/media/med_01jpyx4g9m8b4y50a4gx3t7p1n.webp",
  "mimeType": "image/webp",
  "size": 1024000
}
```

### Abort an upload session

`POST /api/uploads/:id/abort`

Response:

```json
{ "success": true }
```

### List uploaded media

`GET /api/upload`

Auth: `Session or token`

This is the media metadata endpoint used by `npx jant media list`.

Query parameters:

| Parameter    | Type    | Required | Default | Notes                                      |
| ------------ | ------- | -------- | ------- | ------------------------------------------ |
| `limit`      | integer | no       | `50`    | `1` to `200`                               |
| `mimePrefix` | string  | no       | none    | Prefix filter such as `image/` or `video/` |

Response:

```json
{
  "media": [
    {
      "id": "med_01jpyx4g9m8b4y50a4gx3t7p1n",
      "siteId": "sit_01jpyx1v6z9k4c7b2m5q8r3nfh",
      "postId": null,
      "filename": "photo.webp",
      "originalName": "photo.webp",
      "mimeType": "image/webp",
      "size": 1024000,
      "provider": "r2",
      "width": 1200,
      "height": 800,
      "durationSeconds": null,
      "alt": "Cover image",
      "position": "0",
      "blurhash": null,
      "waveform": null,
      "summary": null,
      "chars": null,
      "mediaKind": "image",
      "createdAt": 1706000000,
      "updatedAt": 1706000000,
      "type": "media",
      "url": "/media/med_01jpyx4g9m8b4y50a4gx3t7p1n.webp",
      "previewUrl": "/media/med_01jpyx4g9m8b4y50a4gx3t7p1n.webp",
      "posterUrl": null
    }
  ]
}
```

Notes:

- This list may include ordinary uploaded binaries and stored text attachments.
- Text attachments use `type: "text"` and expose `contentFormat` plus `contentUrl` instead of `url`, `previewUrl`, and `posterUrl`.

### Get a media item

`GET /api/upload/:id`

Auth: `Session or token`

Returns one media or text attachment record using the same response shape as `GET /api/upload`.

### Update media alt text

`PATCH /api/upload/:id`

Auth: `Session or token`

Request body:

```json
{
  "alt": "Cover image"
}
```

Rules:

- `alt` is trimmed before storing.
- Max length is `500`.

Response: `200 OK` with the updated media object.

### Delete a media item

`DELETE /api/upload/:id`

Auth: `Session or token`

Deletes the media record and its stored object.

Response:

```json
{ "success": true }
```

### Legacy one-shot upload

Base path: `/api/upload`

Use this only if you want the older multipart form upload behavior in a single request. New clients should prefer `/api/uploads`.

#### Upload a file

`POST /api/upload`

Content type: `multipart/form-data`

Form fields:

| Field      | Type    | Required | Default | Notes                          |
| ---------- | ------- | -------- | ------- | ------------------------------ |
| `file`     | file    | yes      | —       | Main file                      |
| `width`    | integer | no       | `null`  | Image/video width              |
| `height`   | integer | no       | `null`  | Image/video height             |
| `alt`      | string  | no       | `null`  | Alt text                       |
| `blurhash` | string  | no       | `null`  | Blurhash                       |
| `waveform` | string  | no       | `null`  | Audio waveform                 |
| `summary`  | string  | no       | `null`  | Summary for text uploads       |
| `poster`   | file    | no       | —       | Poster frame for video uploads |

Response:

```json
{
  "id": "med_01jpyx4g9m8b4y50a4gx3t7p1n",
  "filename": "med_01jpyx4g9m8b4y50a4gx3t7p1n.jpg",
  "url": "/media/med_01jpyx4g9m8b4y50a4gx3t7p1n.jpg",
  "mimeType": "image/jpeg",
  "size": 1024000
}
```

If the request sends `Accept: text/event-stream`, the endpoint may return SSE patches instead of JSON for dashboard use.

### Legacy explicit multipart relay

Base path: `/api/upload/multipart`

This is the older chunked-upload API. Prefer `/api/uploads` unless you already implement this flow.

#### Initiate a multipart upload

`POST /api/upload/multipart`

Request body:

```json
{
  "filename": "video.mp4",
  "contentType": "video/mp4",
  "size": 250000000
}
```

Response:

```json
{
  "id": "med_01jpyx4g9m8b4y50a4gx3t7p1n",
  "uploadId": "upload-123",
  "storageKey": "media/...",
  "filename": "med_01jpyx4g9m8b4y50a4gx3t7p1n.mp4",
  "originalName": "video.mp4"
}
```

#### Upload one part

`PUT /api/upload/multipart/:id/part?partNumber=N&storageKey=...&uploadId=...`

- Body: raw part bytes
- Response:

```json
{
  "partNumber": 1,
  "etag": "etag-value"
}
```

#### Upload a poster frame

`PUT /api/upload/multipart/:id/poster`

Content type: `multipart/form-data`

Form field:

| Field    | Type | Required | Default | Notes             |
| -------- | ---- | -------- | ------- | ----------------- |
| `poster` | file | yes      | —       | WebP poster frame |

Response:

```json
{
  "posterKey": "media/.../posters/..."
}
```

#### Complete the multipart upload

`POST /api/upload/multipart/:id/complete`

Request body:

```json
{
  "storageKey": "media/...",
  "uploadId": "upload-123",
  "parts": [{ "partNumber": 1, "etag": "etag-1" }],
  "filename": "med_....mp4",
  "originalName": "video.mp4",
  "contentType": "video/mp4",
  "size": 250000000,
  "width": 1920,
  "height": 1080,
  "blurhash": "optional",
  "waveform": "optional",
  "posterKey": "media/.../poster.webp"
}
```

Response:

```json
{
  "id": "med_01jpyx4g9m8b4y50a4gx3t7p1n",
  "filename": "med_01jpyx4g9m8b4y50a4gx3t7p1n.mp4",
  "url": "/media/med_01jpyx4g9m8b4y50a4gx3t7p1n.mp4",
  "mimeType": "video/mp4",
  "size": 250000000
}
```

#### Abort the multipart upload

`POST /api/upload/multipart/:id/abort`

Request body:

```json
{
  "storageKey": "media/...",
  "uploadId": "upload-123"
}
```

Response:

```json
{ "success": true }
```

---

## Collections

Base path: `/api/collections`

Collections group posts by topic. A post can belong to multiple collections.

Collection responses include these fields:

| Field              | Type                                  | Notes                          |
| ------------------ | ------------------------------------- | ------------------------------ |
| `id`               | `col_*` string                        | Collection ID                  |
| `siteId`           | string                                | Owning site                    |
| `slug`             | string                                | Canonical collection slug      |
| `title`            | string                                | Display title                  |
| `description`      | string \| `null`                      | Optional description           |
| `sortOrder`        | `newest` \| `oldest` \| `rating_desc` | Per-collection post sort order |
| `createdAt`        | integer                               | Unix seconds                   |
| `updatedAt`        | integer                               | Unix seconds                   |
| `postCount`        | integer                               | Only present in list responses |
| `recentActivityAt` | integer                               | Only present in list responses |

Directory item responses include these fields:

| Field          | Type                                | Notes                            |
| -------------- | ----------------------------------- | -------------------------------- |
| `id`           | `cdi_*` string                      | Directory item ID                |
| `siteId`       | string                              | Owning site                      |
| `type`         | `collection` \| `divider` \| `link` | Item kind                        |
| `collectionId` | `col_*` string \| `null`            | Present for `type: "collection"` |
| `label`        | string \| `null`                    | Divider label or link label      |
| `url`          | string \| `null`                    | Present for `type: "link"`       |
| `position`     | string                              | Fractional ordering key          |
| `createdAt`    | integer                             | Unix seconds                     |
| `updatedAt`    | integer                             | Unix seconds                     |

Notes:

- Creating a collection automatically creates a `type: "collection"` directory item.
- Deleting a collection also deletes its `type: "collection"` directory item.
- `POST /api/collections/directory-items` only accepts `divider` and `link`. Collection-backed items are managed through collection CRUD, not this endpoint.

### List collections

`GET /api/collections`

Auth: `Public`

Query parameters:

| Parameter | Type      | Required | Default | Notes                                              |
| --------- | --------- | -------- | ------- | -------------------------------------------------- |
| `view`    | `compose` | no       | none    | Specialized compose view sorted by recent activity |

Default response:

```json
{
  "collections": [
    {
      "id": "col_01jpyx5qds8y79w2dd6sv4rznj",
      "siteId": "sit_01jpyx1v6z9k4c7b2m5q8r3nfh",
      "slug": "reading",
      "title": "Reading",
      "description": "Books I've read",
      "sortOrder": "newest",
      "createdAt": 1706000000,
      "updatedAt": 1706000000,
      "postCount": 12,
      "recentActivityAt": 1706100000
    }
  ],
  "directoryItems": [
    {
      "id": "cdi_01jpyx8r7s3v8m1q5c9k2f6gth",
      "siteId": "sit_01jpyx1v6z9k4c7b2m5q8r3nfh",
      "type": "collection",
      "collectionId": "col_01jpyx5qds8y79w2dd6sv4rznj",
      "label": null,
      "url": null,
      "position": "a0",
      "createdAt": 1706000000,
      "updatedAt": 1706000000
    }
  ]
}
```

Notes:

- The default response returns directory ordering in `directoryItems`.
- `view=compose` returns collections sorted by recent activity and always returns an empty `directoryItems` array.

### Get a collection

`GET /api/collections/:id`

Auth: `Public`

Response:

```json
{
  "id": "col_01jpyx5qds8y79w2dd6sv4rznj",
  "siteId": "sit_01jpyx1v6z9k4c7b2m5q8r3nfh",
  "slug": "reading",
  "title": "Reading",
  "description": "Books I've read",
  "sortOrder": "newest",
  "createdAt": 1706000000,
  "updatedAt": 1706000000
}
```

### Create a collection

`POST /api/collections`

Auth: `Session or token`

Request body:

```json
{
  "slug": "reading",
  "title": "Reading",
  "description": "Books I've read",
  "sortOrder": "newest"
}
```

Fields:

| Field         | Type                                  | Required | Default  | Notes                                                                        |
| ------------- | ------------------------------------- | -------- | -------- | ---------------------------------------------------------------------------- |
| `slug`        | string                                | yes      | —        | Canonical collection slug, max `200`, lowercase letters/numbers/hyphens only |
| `title`       | string                                | yes      | —        | Display title, max `120`                                                     |
| `description` | string                                | no       | `null`   | Optional description, max `500`                                              |
| `sortOrder`   | `newest` \| `oldest` \| `rating_desc` | no       | `newest` | Per-collection post sort order                                               |

Notes:

- Reserved slugs are rejected.
- On success, Jant also creates the collection's `type: "collection"` directory item.

Response: `201 Created` with the collection object, including `siteId`.

### Update a collection

`PUT /api/collections/:id`

Auth: `Session or token`

This is a partial update.

Request body fields:

| Field         | Type                                  | Required | Default   | Notes                              |
| ------------- | ------------------------------------- | -------- | --------- | ---------------------------------- |
| `slug`        | string                                | no       | unchanged | Same rules as create               |
| `title`       | string                                | no       | unchanged | Max `120`                          |
| `description` | string \| `null`                      | no       | unchanged | Send `null` to clear               |
| `sortOrder`   | `newest` \| `oldest` \| `rating_desc` | no       | unchanged | Replaces the collection sort order |

Response: `200 OK` with the updated collection object, including `siteId`.

### Delete a collection

`DELETE /api/collections/:id`

Auth: `Session or token`

This removes the collection itself. Posts remain intact.

Response:

```json
{ "success": true }
```

### Create a directory item

`POST /api/collections/directory-items`

Auth: `Session or token`

Creates a manual directory item for the `/collections` directory page.

Request body:

Divider:

```json
{
  "type": "divider",
  "label": "Essays"
}
```

Link:

```json
{
  "type": "link",
  "label": "Quotes",
  "url": "/archive?format=quote"
}
```

Fields by type:

| Field   | Type             | Required         | Default | Notes                                                         |
| ------- | ---------------- | ---------------- | ------- | ------------------------------------------------------------- |
| `type`  | `divider`        | yes              | —       | Creates a divider item                                        |
| `label` | string \| `null` | no               | `null`  | Divider label, max `60`; blank values are stored as `null`    |
| `type`  | `link`           | yes              | —       | Creates a custom link item                                    |
| `label` | string           | yes (for `link`) | —       | Link label, 1-60 chars after trim                             |
| `url`   | string           | yes (for `link`) | —       | Relative path or absolute `http:`, `https:`, or `mailto:` URL |

Notes:

- `type: "collection"` is not accepted here.
- New items are appended to the end of the directory.

Response:

```json
{
  "id": "cdi_01jpyx8r7s3v8m1q5c9k2f6gth",
  "siteId": "sit_01jpyx1v6z9k4c7b2m5q8r3nfh",
  "type": "divider",
  "collectionId": null,
  "label": "Essays",
  "url": null,
  "position": "a1",
  "createdAt": 1706000000,
  "updatedAt": 1706000000
}
```

### Update a directory item

`PUT /api/collections/directory-items/:id`

Auth: `Session or token`

Request body:

```json
{ "label": "Essays" }
```

This is a partial update.

Request body fields:

| Field   | Type             | Required | Default   | Notes                                               |
| ------- | ---------------- | -------- | --------- | --------------------------------------------------- |
| `label` | string \| `null` | no       | unchanged | For dividers: update label, or send `null` to clear |
| `url`   | string           | no       | unchanged | For links: update URL                               |

Notes:

- Divider items only use `label`.
- Link items use `label` and `url`.
- Link labels cannot be cleared with `null`.
- Collection-backed items should be managed through collection endpoints, not updated directly here.

Response: `200 OK` with the updated directory item.

### Move a directory item

`PUT /api/collections/directory-items/:id/move`

Auth: `Session or token`

Request body:

```json
{
  "after": "cdi_01jpyx8r7s3v8m1q5c9k2f6gth",
  "before": "cdi_01jpyx9m4h7s2v6b1r8k3t5qc"
}
```

Fields:

| Field    | Type                     | Required | Default | Notes                               |
| -------- | ------------------------ | -------- | ------- | ----------------------------------- |
| `after`  | `cdi_*` string \| `null` | no       | `null`  | Place the item after this neighbor  |
| `before` | `cdi_*` string \| `null` | no       | `null`  | Place the item before this neighbor |

Notes:

- `after` and `before` are both optional and nullable.
- Use `before: "<id>"` with `after: null` to move to the beginning.
- Use `after: "<id>"` with `before: null` to move to the end.
- If both are missing or `null`, Jant appends the item to the end.

Response: `200 OK` with the moved directory item, including its new `position`.

### Delete a directory item

`DELETE /api/collections/directory-items/:id`

Auth: `Session or token`

Response:

```json
{ "success": true }
```

### Add a post to a collection

`POST /api/collections/:id/posts`

Auth: `Session or token`

Request body:

```json
{ "postId": "pst_01jpyx3m7gw4w3h7m4bknq0v1d" }
```

Fields:

| Field    | Type           | Required | Default | Notes   |
| -------- | -------------- | -------- | ------- | ------- |
| `postId` | `pst_*` string | yes      | —       | Post ID |

Response:

```json
{ "success": true }
```

### Remove a post from a collection

`DELETE /api/collections/:id/posts/:postId`

Auth: `Session or token`

Removes the post-to-collection association. It does not delete the post or the collection.

Response:

```json
{ "success": true }
```

---

## Navigation Items

Base path: `/api/nav-items`

Navigation items power the header navigation.

Nav item responses include these fields:

| Field       | Type                                              | Notes                             |
| ----------- | ------------------------------------------------- | --------------------------------- |
| `id`        | `nav_*` string                                    | Nav item ID                       |
| `siteId`    | string                                            | Owning site                       |
| `type`      | `link` \| `system`                                | Custom link or built-in item      |
| `systemKey` | `rss` \| `settings` \| `collections` \| `archive` | Only present for `type: "system"` |
| `label`     | string                                            | Display label                     |
| `url`       | string                                            | Stored URL or path                |
| `position`  | string                                            | Fractional ordering key           |
| `createdAt` | integer                                           | Unix seconds                      |
| `updatedAt` | integer                                           | Unix seconds                      |

### List nav items

`GET /api/nav-items`

Auth: `Public`

Response:

```json
{
  "navItems": [
    {
      "id": "nav_01jpyxcv3m7w4b8k2r5s9t1qfh",
      "type": "link",
      "label": "GitHub",
      "url": "https://github.com/your-username",
      "position": "a0",
      "createdAt": 1706000000,
      "updatedAt": 1706000000
    }
  ]
}
```

### Create a nav item

`POST /api/nav-items`

Auth: `Session or token`

Create a custom link:

```json
{
  "type": "link",
  "label": "GitHub",
  "url": "https://github.com/your-username"
}
```

Create a built-in item:

```json
{
  "type": "system",
  "systemKey": "archive"
}
```

Fields by type:

| Field       | Type                                              | Required           | Default | Notes                                                         |
| ----------- | ------------------------------------------------- | ------------------ | ------- | ------------------------------------------------------------- |
| `type`      | `link`                                            | yes                | —       | Creates a custom nav link                                     |
| `label`     | string                                            | yes (for `link`)   | —       | Link label, 1-100 chars after trim                            |
| `url`       | string                                            | yes (for `link`)   | —       | Relative path or absolute `http:`, `https:`, or `mailto:` URL |
| `type`      | `system`                                          | yes                | —       | Creates a built-in nav item                                   |
| `systemKey` | `rss` \| `settings` \| `collections` \| `archive` | yes (for `system`) | —       | Built-in destination key                                      |

System keys:

- `rss`
- `settings`
- `collections`
- `archive`

Notes:

- Built-in items get their label and URL automatically.
- Jant rejects duplicate built-in items.

Response: `201 Created` with the new nav item.

### Move a nav item

`PUT /api/nav-items/:id/move`

Auth: `Session or token`

Request body:

```json
{
  "after": "nav_...",
  "before": "nav_..."
}
```

- `after` and `before` are optional and nullable.
- If neither is provided, the item moves to the end.

Response: `200 OK` with the moved nav item, including its new `position`.

### Update a nav item

`PUT /api/nav-items/:id`

Auth: `Session or token`

Request body:

```json
{
  "label": "Source",
  "url": "https://github.com/your-username"
}
```

Notes:

- This is a partial update.
- Built-in system items reject manual label and URL edits.
- Only `label` and `url` are accepted.

Response: `200 OK` with the updated nav item.

### Delete a nav item

`DELETE /api/nav-items/:id`

Auth: `Session or token`

Response:

```json
{ "success": true }
```

---

## Custom URLs

Base path: `/api/custom-urls`

Custom URLs let you attach extra paths to posts or collections, or define internal redirects.

Custom URL responses include these fields:

| Field          | Type                                 | Notes                                             |
| -------------- | ------------------------------------ | ------------------------------------------------- |
| `id`           | `pth_*` string                       | Custom URL ID                                     |
| `path`         | string                               | Normalized path without a leading slash           |
| `targetType`   | `post` \| `collection` \| `redirect` | Target kind                                       |
| `targetId`     | string \| `null`                     | Resolved post/collection TypeID for alias records |
| `toPath`       | string \| `null`                     | Redirect destination with a leading slash         |
| `redirectType` | `301` \| `302` \| `null`             | Redirect status for redirect records              |
| `createdAt`    | integer                              | Unix seconds                                      |

Target types:

| Type         | Meaning                             | Key fields               |
| ------------ | ----------------------------------- | ------------------------ |
| `post`       | Alias that resolves to a post       | `targetId`               |
| `collection` | Alias that resolves to a collection | `targetId`               |
| `redirect`   | Internal redirect to another path   | `toPath`, `redirectType` |

### List custom URLs

`GET /api/custom-urls`

Auth: `Session or token`

Query parameters:

| Parameter | Type    | Required | Default |
| --------- | ------- | -------- | ------- |
| `page`    | integer | no       | `1`     |

Response:

```json
{
  "customUrls": [
    {
      "id": "pth_01jpyxb27t6m4v9r2k8s5c1qfh",
      "path": "blog/old-post",
      "targetType": "redirect",
      "targetId": null,
      "toPath": "/my-new-slug",
      "redirectType": 301,
      "createdAt": 1706000000
    },
    {
      "id": "pth_01jpyxbk8v4m2s7r9c5t1g6qdn",
      "path": "essays/on-writing",
      "targetType": "post",
      "targetId": "pst_01jpyx3m7gw4w3h7m4bknq0v1d",
      "toPath": null,
      "redirectType": null,
      "createdAt": 1706000000
    }
  ],
  "total": 42,
  "page": 1,
  "totalPages": 1
}
```

Notes:

- List and create responses only cover alias and redirect records. Canonical post and collection slugs are not returned here.
- Response `path` values are normalized and do not include a leading slash.
- Alias responses return the resolved post or collection TypeID in `targetId`.

### Create a custom URL

`POST /api/custom-urls`

Auth: `Session or token`

Request body:

```json
{
  "path": "/blog/old-post",
  "targetType": "redirect",
  "toPath": "/my-new-slug",
  "redirectType": "301"
}
```

Fields:

| Field          | Type                                 | Required                            | Default | Notes                                                                         |
| -------------- | ------------------------------------ | ----------------------------------- | ------- | ----------------------------------------------------------------------------- |
| `path`         | string                               | yes                                 | —       | Must start with `/`; max `512`; lowercase letters, numbers, `-`, and `/` only |
| `targetType`   | `post` \| `collection` \| `redirect` | yes                                 | —       | Target kind                                                                   |
| `targetId`     | string                               | required for `post` or `collection` | —       | Send the canonical slug, not the TypeID                                       |
| `toPath`       | string                               | required for `redirect`             | —       | Internal destination path such as `/new-path`; normalized before storage      |
| `redirectType` | `"301"` \| `"302"`                   | no                                  | `301`   | Only used for `redirect`                                                      |

Examples:

Redirect an old path:

```json
{
  "path": "/blog/2024/my-old-post",
  "targetType": "redirect",
  "toPath": "/my-new-slug",
  "redirectType": "301"
}
```

Create an alias for a post:

```json
{
  "path": "/essays/on-writing",
  "targetType": "post",
  "targetId": "on-writing"
}
```

Important notes:

- `path` must not collide with an existing slug or custom URL.
- Reserved paths are rejected.
- Redirects are for internal paths. External redirect targets are not supported by this API.
- Post and collection targets must already exist by slug or the API returns `404`.
- Create responses resolve slug targets to TypeIDs.

Response: `201 Created` with the new custom URL object.

### Delete a custom URL

`DELETE /api/custom-urls/:id`

Auth: `Session or token`

This only deletes non-canonical custom URL records. Canonical post and collection slugs are not removable through this endpoint.

Response:

```json
{ "success": true }
```

---

## Settings

Base path: `/api/settings`

These endpoints manage user-editable site settings and a small amount of dashboard state.

All settings endpoints require auth.

### Editable setting keys

`GET /api/settings` and `PUT /api/settings` operate on editable site config only.

All values are strings because they map directly to stored config values.

| Key                          | Meaning                 | Example value       |
| ---------------------------- | ----------------------- | ------------------- |
| `SITE_NAME`                  | Site title              | `"My Blog"`         |
| `SITE_DESCRIPTION`           | Site description        | `"Notes and links"` |
| `SITE_LANGUAGE`              | Language code           | `"en"`              |
| `HOME_DEFAULT_VIEW`          | Home feed mode          | `"latest"`          |
| `MAIN_RSS_FEED`              | Canonical feed kind     | `"featured"`        |
| `TIME_ZONE`                  | IANA timezone           | `"Asia/Shanghai"`   |
| `SITE_FOOTER`                | Footer HTML/text        | `"<p>Footer</p>"`   |
| `SHOW_JANT_BRANDING_ON_HOME` | Branding toggle         | `"true"`            |
| `NOINDEX`                    | Search-engine exclusion | `"true"`            |

Notes:

- Editable keys are derived from the config registry; env-only and internal keys are excluded.
- Boolean and numeric settings are still strings in the API.
- Send strings in `PUT /api/settings`, not JSON booleans or numbers.
- `TIME_ZONE` is normalized to canonical IANA names when possible.
- `GET /api/settings` fills in defaults for editable keys that are not stored yet.
- In demo mode, `NOINDEX` is always returned as `"true"`.

### Get editable settings

`GET /api/settings`

Auth: `Session or token`

Response:

```json
{
  "settings": {
    "SITE_NAME": "Jant",
    "SITE_DESCRIPTION": "Thoughts, links, and quotes — one post at a time",
    "SITE_LANGUAGE": "en",
    "HOME_DEFAULT_VIEW": "latest",
    "MAIN_RSS_FEED": "featured",
    "TIME_ZONE": "UTC",
    "SITE_FOOTER": "",
    "SHOW_JANT_BRANDING_ON_HOME": "",
    "NOINDEX": ""
  }
}
```

Notes:

- The response always returns the full editable settings object, not only keys stored in the database.
- Environment-only and internal keys never appear in this response.

### Update editable settings

`PUT /api/settings`

Auth: `Session or token`

Request body:

```json
{
  "SITE_NAME": "New Name",
  "SITE_DESCRIPTION": "Updated description"
}
```

Request rules:

- The body must be a JSON object whose values are strings.
- `SITE_NAME` is trimmed and limited to `120` characters.
- `SITE_DESCRIPTION` is trimmed and limited to `300` characters.
- `SITE_FOOTER` is trimmed and limited to `5000` characters.
- `TIME_ZONE` accepts canonical IANA names and normalizes legacy aliases such as `"Beijing"` to `"Asia/Shanghai"`.

Behavior:

- Editable keys are updated.
- Rejected keys are ignored if at least one editable key remains.
- If every provided key is rejected, the endpoint returns `400`.
- Successful responses return the full current editable settings object, plus optional top-level `rejectedKeys`.

Example partial-apply response:

```json
{
  "settings": {
    "SITE_NAME": "New Name",
    "SITE_DESCRIPTION": "Thoughts, links, and quotes — one post at a time",
    "SITE_LANGUAGE": "en",
    "HOME_DEFAULT_VIEW": "latest",
    "MAIN_RSS_FEED": "featured",
    "TIME_ZONE": "UTC",
    "SITE_FOOTER": "",
    "SHOW_JANT_BRANDING_ON_HOME": "",
    "NOINDEX": ""
  },
  "rejectedKeys": ["AUTH_SECRET"]
}
```

Rejected keys are returned:

- in `details.rejectedKeys` on `400`
- in top-level `rejectedKeys` on successful partial updates

In demo mode, `NOINDEX` updates are rejected and the returned value stays `"true"`.

### Mark compose shortcut discovery as seen

`POST /api/settings/discovery/compose-open-shortcut`

Auth: `Session or token`

This is a small dashboard-state endpoint used by the compose UI.

- First call stores the timestamp and returns `201`
- Later calls return `200`

Response:

```json
{ "learned": true }
```

### Upload site avatar and icons

`POST /api/settings/avatar`

Auth: `Session or token`

Content type: `multipart/form-data`

Form fields:

| Field        | Type | Required | Default | Notes                  |
| ------------ | ---- | -------- | ------- | ---------------------- |
| `file`       | file | yes      | —       | Main avatar image      |
| `favicon`    | file | no       | —       | Favicon `.ico` payload |
| `appleTouch` | file | no       | —       | Apple touch icon       |

Response:

```json
{ "success": true }
```

Notes:

- File storage must be configured or the endpoint returns `500`.
- Omitting `file` returns `400`.
- On success, this endpoint updates the internal avatar/favicon settings used by site rendering.

### Remove site avatar and related icons

`DELETE /api/settings/avatar`

Auth: `Session or token`

Removes the stored avatar and related favicon settings.

Response:

```json
{ "success": true }
```

---

## Search

Base path: `/api/search`

Search is public and only returns published posts.

### Search posts

`GET /api/search`

Auth: `Public`

Query parameters:

| Parameter | Type    | Required | Default | Notes                |
| --------- | ------- | -------- | ------- | -------------------- |
| `q`       | string  | yes      | none    | Maximum length `200` |
| `limit`   | integer | no       | `20`    | Maximum `50`         |

Result objects include these fields:

| Field         | Type                        | Notes                                             |
| ------------- | --------------------------- | ------------------------------------------------- |
| `id`          | `pst_*` string              | Post ID                                           |
| `format`      | `note` \| `link` \| `quote` | Post format                                       |
| `slug`        | string                      | Canonical slug                                    |
| `snippet`     | string \| omitted           | Search snippet; may contain `<mark>` tags         |
| `publishedAt` | integer \| `null`           | Publish timestamp                                 |
| `permalink`   | string                      | Public path, including any configured site prefix |
| `title`       | string \| `null`            | Present for `note` and `link` results             |
| `url`         | string \| `null`            | Present for `note` and `link` results             |
| `sourceName`  | string \| `null`            | Present instead of `title` for `quote` results    |
| `sourceUrl`   | string \| `null`            | Present instead of `url` for `quote` results      |

Response:

```json
{
  "query": "hello",
  "results": [
    {
      "id": "pst_01jpyx3m7gw4w3h7m4bknq0v1d",
      "format": "note",
      "title": "Hello World",
      "slug": "hello-world",
      "snippet": "...matched <mark>hello</mark> text...",
      "publishedAt": 1706000000,
      "permalink": "/hello-world",
      "url": null
    }
  ],
  "count": 1
}
```

Notes:

- `snippet` may contain `<mark>` tags.
- All search results include `permalink`.
- Quote results use `sourceName` and `sourceUrl` instead of `title` and `url`.
- Search only returns published posts.

---

## Export

Base path: `/api/export`

### Export the site as a Zola archive

`POST /api/export/zola`

Auth: `Session or token`

Request body: none

Response:

- Content type: `application/zip`
- Download filename: `jant-export.zip`

Archive contents:

- `config.toml`
- `content/<post-slug>/index.md` for each root post or merged thread
- `content/c/<collection-slug>/_index.md` for each collection
- `content/_index.md` and `content/archive/_index.md`
- `templates/*` and `static/*`
- `README.md`

Notes:

- Thread replies are merged into their thread root page in the exported Zola content.
- Collection membership is exported as the `c` taxonomy.
- Navigation items, theme CSS, custom CSS, favicon, and Apple touch icon are included in the scaffold when available.
- Exported post bodies become Markdown. Media references point back to the original Jant media URLs; the ZIP does not bundle original media binaries.

Example:

```bash
curl -X POST https://your-site.com/api/export/zola \
  -H "Authorization: Bearer jnt_YOUR_TOKEN" \
  -o jant-export.zip
```

This export is suitable for:

- static publishing with Zola
- archival
- round-trip import into another Jant instance

For the CLI import/export workflow, see [Export and Import](export-and-import.md).

---

## Internal Admin API

Base path: `/api/internal`

These endpoints are for hosted control-plane and maintenance workflows, not normal site integrations.

Requirements:

- `Authorization: Bearer <INTERNAL_ADMIN_TOKEN>`
- Some site-management endpoints also require host-based site resolution mode

If `INTERNAL_ADMIN_TOKEN` is not configured, these endpoints return `404`.

Notes:

- `api-tokens` and upload-cleanup endpoints operate on the current resolved site.
- Managed-site lifecycle and domain endpoints return `409` outside host-based mode.

### API token maintenance

#### Health check

`GET /api/internal/api-tokens/health`

Auth: `Internal admin token`

Response:

```json
{ "ok": true }
```

#### Purge all user API tokens for the current site

`POST /api/internal/api-tokens/purge`

Auth: `Internal admin token`

This removes user-created API tokens for the currently resolved site only.

Response:

```json
{ "deleted": 2 }
```

### Upload session maintenance

#### Clean up expired temporary upload sessions

`POST /api/internal/uploads/cleanup`

Auth: `Internal admin token`

Request body:

```json
{ "limit": 10 }
```

Fields:

| Field   | Type    | Required | Default     | Notes                           |
| ------- | ------- | -------- | ----------- | ------------------------------- |
| `limit` | integer | no       | unspecified | Positive integer, maximum `500` |

Notes:

- The JSON body is optional. If the request is not JSON, the endpoint treats it as an empty object.
- File storage must be configured or the endpoint returns `500`.

Response:

```json
{
  "abortedMultipartUploads": 0,
  "deletedSessions": 1
}
```

Response fields:

| Field                     | Type    | Notes                                          |
| ------------------------- | ------- | ---------------------------------------------- |
| `abortedMultipartUploads` | integer | Number of underlying multipart uploads aborted |
| `deletedSessions`         | integer | Number of expired upload-session rows removed  |

### Managed site lifecycle

These endpoints are only available in host-based mode.

#### Create a managed site

`POST /api/internal/sites`

Auth: `Internal admin token`

Request body:

```json
{
  "key": "demo-cloud",
  "primaryHost": "demo-cloud.example.com",
  "siteName": "Demo Cloud"
}
```

Fields:

| Field         | Type   | Required | Default | Notes                                                     |
| ------------- | ------ | -------- | ------- | --------------------------------------------------------- |
| `key`         | string | yes      | —       | Lowercase site key, `3-40` chars, letters/numbers/hyphens |
| `primaryHost` | string | yes      | —       | Lowercase hostname, max `255`                             |
| `siteName`    | string | yes      | —       | Display name, `1-120` chars after trim                    |

Response:

```json
{
  "primaryHost": "demo-cloud.example.com",
  "siteId": "sit_01...",
  "status": "active"
}
```

Notes:

- New managed sites start with `status: "active"`.
- Jant seeds onboarding as completed and stores the provided `SITE_NAME`.
- Duplicate site keys return `409`.
- Duplicate primary hosts return `409`.

#### Delete a managed site

`DELETE /api/internal/sites/:siteId`

Auth: `Internal admin token`

Response: `204 No Content`

This removes the target site and its associated site-scoped records.

#### Get managed-site media usage

`GET /api/internal/sites/:siteId/media-usage`

Auth: `Internal admin token`

Response:

```json
{
  "siteId": "sit_01...",
  "mediaBytesUsed": 3072
}
```

#### Export a managed site

`GET /api/internal/sites/:siteId/export`

Auth: `Internal admin token`

Response:

- Content type: `application/zip`
- Filename resembles `<site-key>-site-export.zip`
- Export shape matches `POST /api/export/zola`, but for the specified managed site

#### Suspend a managed site

`POST /api/internal/sites/:siteId/suspend`

Auth: `Internal admin token`

Response:

```json
{
  "siteId": "sit_01...",
  "status": "suspended"
}
```

#### Resume a managed site

`POST /api/internal/sites/:siteId/resume`

Auth: `Internal admin token`

Response:

```json
{
  "siteId": "sit_01...",
  "status": "active"
}
```

### Managed site domains

Domain objects include these fields:

| Field               | Type                 | Notes                     |
| ------------------- | -------------------- | ------------------------- |
| `id`                | string               | Site domain ID            |
| `host`              | string               | Lowercase hostname        |
| `kind`              | `primary` \| `alias` | Domain role for the site  |
| `redirectToPrimary` | boolean              | Whether requests redirect |

#### List domains

`GET /api/internal/sites/:siteId/domains`

Auth: `Internal admin token`

Response:

```json
{
  "domains": [
    {
      "host": "example.com",
      "id": "sdm_01...",
      "kind": "primary",
      "redirectToPrimary": true
    }
  ]
}
```

#### Add a domain

`POST /api/internal/sites/:siteId/domains`

Auth: `Internal admin token`

Request body:

```json
{
  "host": "www.example.com",
  "makePrimary": false
}
```

Fields:

| Field         | Type    | Required | Default | Notes                                         |
| ------------- | ------- | -------- | ------- | --------------------------------------------- |
| `host`        | string  | yes      | —       | Lowercase hostname, max `255`                 |
| `makePrimary` | boolean | no       | `false` | When true, demotes the current primary domain |

Notes:

- Hosts are trimmed and normalized to lowercase.
- Adding a host already attached to this site returns `409`.
- Adding a host already attached to another site returns `409`.

Response: `201 Created` with the full `domains` list.

#### Promote a domain to primary

`POST /api/internal/sites/:siteId/domains/:domainId/primary`

Auth: `Internal admin token`

Response: updated `domains` list.

Notes:

- If the target domain is already primary, the response still returns the current `domains` list.
- Missing `domainId` returns `404`.

#### Delete a domain

`DELETE /api/internal/sites/:siteId/domains/:domainId`

Auth: `Internal admin token`

Response: updated `domains` list.

Notes:

- Deleting the current primary domain without promoting another domain first returns `409`.
- Missing `domainId` returns `404`.

---

## Other Public Endpoints

These are not part of the JSON content-management API, but they are often useful in automation or operations.

| Endpoint                      | Auth   | Response | Notes                                                           |
| ----------------------------- | ------ | -------- | --------------------------------------------------------------- |
| `GET /health`                 | Public | JSON     | Lightweight liveness probe                                      |
| `GET /readyz`                 | Public | JSON     | Readiness check for startup config and database                 |
| `GET /feed`                   | Public | RSS      | Canonical site feed (`latest` or `featured`, based on settings) |
| `GET /feed/atom.xml`          | Public | Atom     | Canonical site feed in Atom format                              |
| `GET /feed/latest`            | Public | RSS      | Latest public posts feed                                        |
| `GET /feed/latest/atom.xml`   | Public | Atom     | Latest public posts feed                                        |
| `GET /feed/featured`          | Public | RSS      | Featured posts feed                                             |
| `GET /feed/featured/atom.xml` | Public | Atom     | Featured posts feed                                             |
| `GET /feed/all`               | Public | Redirect | Legacy alias to `/feed/latest`                                  |
| `GET /feed/all/atom.xml`      | Public | Redirect | Legacy Atom alias to `/feed/latest/atom.xml`                    |
| `GET /:slug/feed`             | Public | RSS      | Collection feed for one collection                              |
| `GET /collections/:slug/feed` | Public | RSS      | Collection feed for a collection selection                      |
| `GET /sitemap.xml`            | Public | XML      | Sitemap for published posts                                     |
| `GET /robots.txt`             | Public | Text     | Robots rules and sitemap location                               |

### Health and readiness

#### Liveness

`GET /health`

Auth: `Public`

Response:

```json
{ "status": "ok" }
```

This endpoint bypasses site resolution and only answers whether the process is up.

#### Readiness

`GET /readyz`

Auth: `Public`

Response:

```json
{
  "status": "ok",
  "checks": {
    "startupConfig": { "ok": true },
    "database": { "ok": true }
  }
}
```

Notes:

- Returns `200` when all checks pass.
- Returns `503` when `status` is `"error"`.
- `startupConfig.error` and `database.error` appear when a check fails.
- This endpoint is stricter than `/health`: it verifies startup configuration and performs a lightweight database query.

### Feeds

All feed endpoints are public and return cached XML with `Cache-Control: public, max-age=180`.

Feed notes:

- `GET /feed` and `GET /feed/atom.xml` use the configured `MAIN_RSS_FEED` to choose `latest` or `featured`.
- `GET /feed/latest` and `GET /feed/latest/atom.xml` accept `?format=note|link|quote`.
- Invalid `format` values are ignored rather than rejected.
- Latest feeds include published root posts only, excluding private posts and `latest_hidden` posts.
- Featured feeds include published featured root posts and exclude private posts.
- `GET /feed/all` and `GET /feed/all/atom.xml` are legacy aliases that redirect to the `latest` feed with `308`, preserving the query string.
- `GET /:slug/feed` returns an RSS feed for a single collection.
- `GET /collections/:slug/feed` returns an RSS feed for a collection selection and redirects normalized selections to the canonical path with `301`.

### Sitemap and robots

#### Sitemap

`GET /sitemap.xml`

Auth: `Public`

Notes:

- Returns XML with content type `application/xml; charset=utf-8`.
- Includes up to `1000` published root posts.
- Excludes private posts.

#### Robots

`GET /robots.txt`

Auth: `Public`

Notes:

- Returns text with content type `text/plain; charset=utf-8`.
- When `NOINDEX` is enabled, the file disallows the entire site with `Disallow: /`.
- Otherwise it allows the public site and disallows the internal utility prefix `/_/`.
- Always includes an absolute `Sitemap:` line that points at `/sitemap.xml`.

---

## Common Workflows

### Publish a post with an uploaded image

1. Start an upload session:

```bash
curl -X POST https://your-site.com/api/uploads/init \
  -H "Authorization: Bearer jnt_YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "filename": "photo.jpg",
    "contentType": "image/jpeg",
    "size": 1024000
  }'
```

2. Upload the file using the returned transport.
3. Complete the upload and keep the returned `med_*` ID.
4. Create the post:

```bash
curl -X POST https://your-site.com/api/posts \
  -H "Authorization: Bearer jnt_YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "format": "note",
    "title": "Hello World",
    "bodyMarkdown": "First post.",
    "attachments": [
      { "type": "media", "mediaId": "med_01..." }
    ]
  }'
```

### Automate content from a generated site

Projects created with `create-jant` include `examples/agent-content-automation/README.md`.

Use that folder when you want ready-made examples for:

- creating note and quote posts from JSON
- updating editable settings from JSON
- uploading media and attaching the returned `med_*` ID to a post
- calling `/api/mcp` from an MCP-capable agent

When the automation runs on the same machine as the site, prefer the local CLI first:

```bash
npx jant posts create --input ./examples/agent-content-automation/note.json
npx jant media upload ./path/to/photo.webp --alt "Cover image"
npx jant settings update --input ./examples/agent-content-automation/site-settings.json
```

### Migrate content from another system

Recommended order:

1. Create collections first if you want to preserve categories or tags.
2. Upload files and keep the returned media IDs.
3. Create posts with original `publishedAt` timestamps.
4. Use `path` on post creation or `custom-urls` after creation to preserve old URLs.

Migration tips:

- Use `bodyMarkdown` unless you already have TipTap JSON.
- Use `replyToId` to rebuild threads.
- Use `status: "draft"` for unpublished imports.
- The API is not idempotent on its own. If your importer may retry, track created IDs or slugs in your own process.

### Export a site

```bash
curl -X POST https://your-site.com/api/export/zola \
  -H "Authorization: Bearer jnt_YOUR_TOKEN" \
  -o jant-export.zip
```

---

## Versioning and Stability

The API is currently unversioned.

Practical stability rules:

- The site-owner endpoints documented here are intended to be scriptable.
- `/api/internal/*` is operational rather than public API surface and may change more aggressively.
- Breaking changes are announced in release notes rather than through URL-based versioning.
