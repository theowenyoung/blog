# Jant API Reference

REST API for programmatic access to your Jant microblog. Use it to publish posts, upload media, manage collections, and migrate content from other platforms.

**Base URL:** `https://your-site.com`

All endpoints return JSON. Timestamps are Unix seconds (not milliseconds).

---

## Authentication

Most API endpoints require authentication. Public endpoints are explicitly marked.

### API Tokens (recommended for scripts)

1. Sign in to your Jant dashboard
2. Go to **Settings > API Tokens**
3. Enter a name (e.g. "Migration Script") and create the token
4. Copy the token immediately — it starts with `jnt_` and is shown only once

Use it in the `Authorization` header:

```
Authorization: Bearer jnt_a1b2c3d4e5f6...
```

Example:

```bash
curl https://your-site.com/api/posts \
  -H "Authorization: Bearer jnt_YOUR_TOKEN"
```

Tokens grant full API access (equivalent to session auth). Store them securely. You can revoke a token anytime from Settings > API Tokens.

### Session Cookies

Sign in via the web UI at `/signin`. The session cookie is automatically included in browser requests.

### Errors

Unauthenticated requests to protected endpoints return:

```json
{ "error": "Unauthorized", "code": "UNAUTHORIZED" }
```

---

## Error Format

All errors follow this structure:

```json
{
  "error": "Human-readable message",
  "code": "ERROR_CODE",
  "details": {}
}
```

The `details` field is only present for validation errors and contains field-level messages.

| Code                     | HTTP Status | Meaning                               |
| ------------------------ | ----------- | ------------------------------------- |
| `VALIDATION_ERROR`       | 400         | Invalid input                         |
| `UNAUTHORIZED`           | 401         | Missing or invalid auth               |
| `FORBIDDEN`              | 403         | Not allowed                           |
| `NOT_FOUND`              | 404         | Resource doesn't exist                |
| `CONFLICT`               | 409         | Slug conflict or constraint violation |
| `RATE_LIMIT`             | 429         | Too many requests                     |
| `CONFIGURATION_ERROR`    | 500         | Missing or invalid server config      |
| `EXTERNAL_SERVICE_ERROR` | 500         | Internal failure                      |

All ID parameters must be valid TypeIDs with the expected prefix. Examples: posts use `pst_*`, media uses `med_*`, collections use `col_*`, path records use `pth_*`. Invalid IDs return `400`.

---

## Posts

Base path: `/api/posts`

Jant has three post formats:

| Format  | Purpose                                                  | Key fields                                   |
| ------- | -------------------------------------------------------- | -------------------------------------------- |
| `note`  | Original content (short thoughts, long articles, images) | `bodyMarkdown`, `title` (optional)           |
| `link`  | Shared reference (articles, tools, videos)               | `url` (important), `bodyMarkdown` (optional) |
| `quote` | Cited text (book excerpts, quotes)                       | `quoteText`, `sourceName`, `sourceUrl`       |

### List Posts

```
GET /api/posts
```

**Auth required.**

**Query parameters:**

| Parameter | Type                        | Default     | Description                                                                                           |
| --------- | --------------------------- | ----------- | ----------------------------------------------------------------------------------------------------- |
| `format`  | `note` \| `link` \| `quote` | all         | Filter by format                                                                                      |
| `status`  | `draft` \| `published`      | `published` | Filter by status                                                                                      |
| `cursor`  | string                      | —           | Cursor for pagination. Pass `nextCursor` from the previous response unchanged and treat it as opaque. |
| `limit`   | integer                     | `100`       | Posts per page                                                                                        |

**Response (200):**

```json
{
  "posts": [
    {
      "id": "pst_01jpyx3m7gw4w3h7m4bknq0v1d",
      "format": "note",
      "status": "published",
      "visibility": "public",
      "pinnedAt": null,
      "featuredAt": null,
      "slug": "hello-world",
      "title": "Hello World",
      "url": null,
      "bodyHtml": "<p>Hello world</p>",
      "bodyText": "Hello world",
      "quoteText": null,
      "summary": null,
      "rating": null,
      "replyToId": null,
      "threadId": null,
      "deletedAt": null,
      "publishedAt": 1706000000,
      "lastActivityAt": 1706000000,
      "createdAt": 1706000000,
      "updatedAt": 1706000000,
      "attachments": [
        {
          "type": "media",
          "id": "med_01jpyx4g9m8b4y50a4gx3t7p1n",
          "url": "/media/med_01jpyx4g9m8b4y50a4gx3t7p1n.jpg",
          "previewUrl": "/media/med_01jpyx4g9m8b4y50a4gx3t7p1n.jpg",
          "posterUrl": null,
          "alt": null,
          "blurhash": null,
          "width": 800,
          "height": 600,
          "mimeType": "image/jpeg",
          "originalName": "photo.jpg",
          "size": 1024000,
          "summary": null
        }
      ]
    }
  ],
  "nextCursor": "pst_01jpyx3m7gw4w3h7m4bknq0v1d"
}
```

`nextCursor` is `null` when there are no more pages.

Quote posts use `sourceName` and `sourceUrl` in API responses. They do not expose `title` or `url`.

### Get Post

```
GET /api/posts/:id
```

**Auth required.** Returns the full post with `collectionIds` and ordered `attachments`.

**Response (200):**

```json
{
  "id": "pst_01jpyx3m7gw4w3h7m4bknq0v1d",
  "format": "note",
  "collectionIds": [
    "col_01jpyx5qds8y79w2dd6sv4rznj",
    "col_01jpyx5z8m7b7s8z1v8w9m1q2r"
  ],
  "attachments": [],
  "...": "same fields as list"
}
```

Quote posts returned from `GET /api/posts/:id` also use `sourceName` and `sourceUrl` instead of `title` and `url`.

### Create Post

```
POST /api/posts
```

**Auth required.**

**Request body (JSON):**

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

**Fields:**

| Field           | Type                                     | Required | Default     | Description                                                                                                                                                                                                  |
| --------------- | ---------------------------------------- | -------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `format`        | `note` \| `link` \| `quote`              | **yes**  | —           | Post format                                                                                                                                                                                                  |
| `title`         | string                                   | no       | —           | Post title. Used by `note` and `link` posts                                                                                                                                                                  |
| `body`          | string                                   | no       | —           | Post content as TipTap JSON (used by the editor UI)                                                                                                                                                          |
| `bodyMarkdown`  | string                                   | no       | —           | Post content in Markdown (see [Body Format](#body-format))                                                                                                                                                   |
| `slug`          | string                                   | no       | auto        | URL slug. Auto-generated from title or as random ID. Mutually exclusive with `path`                                                                                                                          |
| `path`          | string                                   | no       | —           | Custom URL path (without leading `/`). If the path is a valid slug, it's used directly; otherwise it's slugified for the URL and the original path is registered as an alias. Mutually exclusive with `slug` |
| `status`        | `draft` \| `published`                   | no       | `published` |                                                                                                                                                                                                              |
| `visibility`    | `public` \| `latest_hidden` \| `private` | no       | `public`    |                                                                                                                                                                                                              |
| `pinned`        | boolean                                  | no       | `false`     | Pin to top of timeline (max 3)                                                                                                                                                                               |
| `featured`      | boolean                                  | no       | `false`     | Mark as featured content                                                                                                                                                                                     |
| `url`           | string (URL)                             | no       | —           | Link URL (for `link` format)                                                                                                                                                                                 |
| `sourceName`    | string                                   | no       | —           | Quote source or attribution name (for `quote` format)                                                                                                                                                        |
| `sourceUrl`     | string (URL)                             | no       | —           | Quote source URL (for `quote` format)                                                                                                                                                                        |
| `quoteText`     | string                                   | no       | —           | Quoted text (for `quote` format)                                                                                                                                                                             |
| `rating`        | integer (1–5)                            | no       | —           | Rating score                                                                                                                                                                                                 |
| `collectionIds` | string[]                                 | no       | —           | Collection TypeIDs to add the post to                                                                                                                                                                        |
| `replyToId`     | string                                   | no       | —           | Parent post TypeID when creating a reply in a thread                                                                                                                                                         |
| `publishedAt`   | integer                                  | no       | now         | Unix timestamp in seconds                                                                                                                                                                                    |
| `attachments`   | attachment[]                             | no       | —           | Ordered attachments (max 20). Use `type: "media"` for uploaded files and `type: "text"` for inline text attachments                                                                                          |

### Attachments

Posts accept and return an ordered `attachments` array. Array order is the attachment order shown on the post.

Input objects:

- Media attachment: `{ "type": "media", "mediaId": "uploaded-media-id", "alt": "Optional alt text" }`
- Text attachment: `{ "type": "text", "contentFormat": "markdown", "content": "# Heading", "summary": "Optional card summary" }`

Response objects:

- Media attachment: includes `url`, `previewUrl`, `mimeType`, `originalName`, `size`, and optional display metadata
- Text attachment: includes `contentFormat`, `summary`, `chars`, and `contentUrl` for fetching the Markdown body

**Slug rules:**

- Lowercased, only `a-z`, `0-9`, and hyphens
- Auto-generated from `title` if omitted, or as a random short ID
- Must be unique across all posts and custom URLs
- Slug conflicts return `409 Conflict`

**Thread behavior:**

- Setting `replyToId` makes this post a reply in an existing thread
- Replies inherit `status` and `visibility` from the thread root

**Response (201):** Full post object with ordered `attachments`.

### Update Post

```
PUT /api/posts/:id
```

**Auth required.** All fields are optional (partial update).

```json
{
  "sourceName": "Epictetus",
  "sourceUrl": "https://example.com/discourses",
  "bodyMarkdown": "Updated commentary in **Markdown**."
}
```

For quote posts, use `sourceName` and `sourceUrl` when creating or updating attribution. `title` and `url` are reserved for note/link post semantics.

**Attachment behavior:**

- Omitting `attachments` → keeps existing attachments
- `"attachments": []` → removes all attachments
- `"attachments": [...]` → replaces all attachments in the given order

**Response (200):** Updated post with ordered `attachments`.

### Get Text Attachment Content

```
GET /api/attachments/:id/content
```

**Auth required.** Returns the Markdown body for a `type: "text"` attachment.

**Response (200):**

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

### Delete Post

```
DELETE /api/posts/:id
```

**Auth required.** Soft-deletes the post. If it's a thread root, all replies are also deleted. Associated media files are permanently removed from storage.

**Response (200):**

```json
{ "success": true }
```

---

## Body Format

Post content can be provided in two ways — use one or the other, not both:

- **`bodyMarkdown`** — Markdown string. The server converts it to the internal document format and renders HTML (`bodyHtml`) and plain text (`bodyText`). **Recommended for API users and scripts.**
- **`body`** — TipTap JSON string. Used by the built-in editor UI. Only use this if you are working with the TipTap document format directly.

### Paragraphs

Separate paragraphs with a blank line:

```markdown
First paragraph.

Second paragraph.
```

### Headings

```markdown
# Heading 1

## Heading 2

### Heading 3
```

### Inline formatting

```markdown
This is **bold** and _italic_ text.
Use `inline code` for code snippets.
This is ~~strikethrough~~ text.
```

### Links

```markdown
[click here](https://example.com)
```

### Images

```markdown
![Alt text](https://example.com/image.png)
```

For file attachments, upload first via `/api/upload`, then reference the returned ID in `attachments` with `type: "media"`.

### Lists

```markdown
- Item 1
- Item 2
- Item 3

1. First
2. Second
3. Third
```

### Blockquotes

```markdown
> Quoted text here.
```

### Code blocks

````markdown
```javascript
console.log("hello");
```
````

### Tables

```markdown
| Header A | Header B |
| -------- | -------- |
| Cell 1   | Cell 2   |
```

### Horizontal rule

```markdown
---
```

### Read-more break

Insert `<!--more-->` on its own line to mark where the summary should cut off:

```markdown
Introduction paragraph.

<!--more-->

Rest of the article.
```

### Response fields

The API response includes two rendered fields derived from `body`/`bodyMarkdown`:

- **`bodyHtml`** — HTML rendering of the content. Use this for display.
- **`bodyText`** — Plain text extraction. Use this for search indexing or previews.

---

## Upload

Base path: `/api/upload`

All upload endpoints require auth.

### Upload File

```
POST /api/upload
```

**Content-Type:** `multipart/form-data`

**Form fields:**

| Field      | Type    | Required | Description                          |
| ---------- | ------- | -------- | ------------------------------------ |
| `file`     | File    | **yes**  | The file to upload                   |
| `width`    | integer | no       | Image/video width in pixels          |
| `height`   | integer | no       | Image/video height in pixels         |
| `blurhash` | string  | no       | BlurHash placeholder (max 200 chars) |
| `summary`  | string  | no       | Summary for text file attachments    |
| `poster`   | File    | no       | Poster frame for video files (WebP)  |

**File limits:** Configurable via `UPLOAD_MAX_FILE_SIZE_MB` env var (default: 500 MB). All MIME types accepted.

**Response (200):**

```json
{
  "id": "med_01jpyx4g9m8b4y50a4gx3t7p1n",
  "filename": "med_01jpyx4g9m8b4y50a4gx3t7p1n.jpg",
  "url": "/media/med_01jpyx4g9m8b4y50a4gx3t7p1n.jpg",
  "mimeType": "image/jpeg",
  "size": 1024000
}
```

Save the `id` — you'll need it to attach the file to a post with `{ "type": "media", "mediaId": "..." }`.

Example:

```bash
# Upload an image
curl -X POST https://your-site.com/api/upload \
  -H "Authorization: Bearer jnt_YOUR_TOKEN" \
  -F "file=@photo.jpg"

# Response: {"id": "med_01jpyx4g9m8b4y50a4gx3t7p1n", "url": "/media/med_01jpyx4g9m8b4y50a4gx3t7p1n.jpg", ...}
```

### List Files

```
GET /api/upload
```

**Query parameters:** `limit` (integer, default: 50)

**Response (200):**

```json
{
  "media": [
    {
      "id": "med_01jpyx4g9m8b4y50a4gx3t7p1n",
      "filename": "med_01jpyx4g9m8b4y50a4gx3t7p1n.jpg",
      "url": "/media/med_01jpyx4g9m8b4y50a4gx3t7p1n.jpg",
      "mimeType": "image/jpeg",
      "size": 1024000,
      "createdAt": 1706000000
    }
  ]
}
```

### Delete File

```
DELETE /api/upload/:id
```

Permanently deletes the file from storage and database.

**Response (200):** `{ "success": true }`

---

## Collections

Base path: `/api/collections`

Collections organize posts by topic (e.g. "Books", "Tools", "Movies"). A post can belong to multiple collections. Collection pages are available at `/c/{slug}`.

### List Collections

```
GET /api/collections
```

Public.

**Response (200):**

```json
{
  "collections": [
    {
      "id": "col_01jpyx5qds8y79w2dd6sv4rznj",
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
  "sidebarItems": [
    {
      "id": "cdi_01jpyx8r7s3v8m1q5c9k2f6gth",
      "type": "collection",
      "collectionId": "col_01jpyx5qds8y79w2dd6sv4rznj",
      "label": null,
      "position": "a0",
      "createdAt": 1706000000,
      "updatedAt": 1706000000
    },
    {
      "id": "cdi_01jpyx93hw5m2s8b6r4v1t9kqn",
      "type": "divider",
      "collectionId": null,
      "label": "Essays",
      "position": "a1",
      "createdAt": 1706000100,
      "updatedAt": 1706000100
    }
  ]
}
```

### Get Collection

```
GET /api/collections/:id
```

Public. Returns a single collection object.

### Create Collection

```
POST /api/collections
```

**Auth required.**

```json
{
  "slug": "reading",
  "title": "Reading",
  "description": "Books I've read",
  "sortOrder": "newest"
}
```

| Field         | Type   | Required | Default  | Description                           |
| ------------- | ------ | -------- | -------- | ------------------------------------- |
| `slug`        | string | **yes**  | —        | URL slug (same rules as post slugs)   |
| `title`       | string | **yes**  | —        | Collection name                       |
| `description` | string | no       | —        | Description text                      |
| `sortOrder`   | string | no       | `newest` | `newest` \| `oldest` \| `rating_desc` |

**Response (201):** Created collection object.

### Update Collection

```
PUT /api/collections/:id
```

**Auth required.** All fields optional. Set `description` to `null` to clear.

### Delete Collection

```
DELETE /api/collections/:id
```

**Auth required.** Deletes the collection. Posts in the collection are NOT deleted.

**Response (200):** `{ "success": true }`

### Create Sidebar Divider

```
POST /api/collections/sidebar-items
```

**Auth required.**

Creates a new divider item for the `/c` collection index.

**Response (201):** Created sidebar item object.

### Update Sidebar Divider

```
PUT /api/collections/sidebar-items/:id
```

**Auth required.**

```json
{ "label": "Essays" }
```

Set `label` to `null` or an empty string to remove it.

**Response (200):** Updated sidebar item object.

### Move Sidebar Item

```
PUT /api/collections/sidebar-items/:id/move
```

**Auth required.**

```json
{
  "after": "cdi_01jpyx8r7s3v8m1q5c9k2f6gth",
  "before": "cdi_01jpyx9m4h7s2v6b1r8k3t5qc"
}
```

Both fields are optional and nullable. Use `null` to move to the beginning or end.

**Response (200):** Updated sidebar item object.

### Delete Sidebar Item

```
DELETE /api/collections/sidebar-items/:id
```

**Auth required.**

**Response (200):** `{ "success": true }`

### Add Post to Collection

```
POST /api/collections/:id/posts
```

**Auth required.**

```json
{ "postId": "pst_01jpyx3m7gw4w3h7m4bknq0v1d" }
```

**Response (201):** `{ "success": true }`

### Remove Post from Collection

```
DELETE /api/collections/:id/posts/:postId
```

**Auth required.**

**Response (200):** `{ "success": true }`

---

## Custom URLs

Base path: `/api/custom-urls`

Custom URLs let you create aliases for posts/collections or set up redirects — useful for blog migration (e.g. mapping old paths like `/blog/2024/my-post` to a Jant post).

Three target types:

| Type         | Purpose                                          | Key fields                   |
| ------------ | ------------------------------------------------ | ---------------------------- |
| `redirect`   | 301/302 redirect to another path or external URL | `toPath`, `redirectType`     |
| `post`       | Alias path that resolves to a post               | `targetId` (post slug)       |
| `collection` | Alias path that resolves to a collection         | `targetId` (collection slug) |

### List Custom URLs

```
GET /api/custom-urls
```

Requires auth. Results are sorted by creation date (newest first) and paginated using `PAGE_SIZE` (default: 50).

**Query parameters:**

| Parameter | Type    | Required | Default | Description |
| --------- | ------- | -------- | ------- | ----------- |
| `page`    | integer | no       | `1`     | Page number |

**Response (200):**

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
      "path": "2024/01/hello",
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

### Create Custom URL

```
POST /api/custom-urls
```

**Auth required.**

```json
{
  "path": "blog/old-post",
  "targetType": "redirect",
  "toPath": "/my-new-slug",
  "redirectType": "301"
}
```

| Field          | Type                                 | Required                | Description                                 |
| -------------- | ------------------------------------ | ----------------------- | ------------------------------------------- |
| `path`         | string                               | **yes**                 | The custom URL path (without leading slash) |
| `targetType`   | `post` \| `collection` \| `redirect` | **yes**                 | What this path resolves to                  |
| `targetId`     | string                               | for `post`/`collection` | Slug of the target post or collection       |
| `toPath`       | string                               | for `redirect`          | Destination path or URL                     |
| `redirectType` | `"301"` \| `"302"`                   | for `redirect`          | Permanent or temporary redirect             |

**Examples:**

Redirect an old blog path:

```json
{
  "path": "blog/2024/my-old-post",
  "targetType": "redirect",
  "toPath": "/my-new-slug",
  "redirectType": "301"
}
```

Create an alias for a post (visitor sees `/essays/on-writing` but the post lives at `/on-writing`):

```json
{
  "path": "essays/on-writing",
  "targetType": "post",
  "targetId": "on-writing"
}
```

**Response (201):** Created custom URL object.

**Errors:**

- `400` — reserved path or invalid input
- `404` — target post/collection slug not found
- `409` — path conflicts with an existing post slug or custom URL

### Delete Custom URL

```
DELETE /api/custom-urls/:id
```

**Auth required.**

**Response (200):** `{ "success": true }`

---

## Search

```
GET /api/search
```

Public. Searches published posts by title and body text.

**Query parameters:**

| Parameter | Type    | Required | Default | Description                  |
| --------- | ------- | -------- | ------- | ---------------------------- |
| `q`       | string  | **yes**  | —       | Search query (max 200 chars) |
| `limit`   | integer | no       | 20      | Max 50                       |

**Response (200):**

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

All search results include `permalink`.

- `note` results use `title`
- `link` results may also include `url` for the external link target
- `quote` results use `sourceName` and `sourceUrl` instead of `title`

---

## Navigation Items

Base path: `/api/nav-items`

### List Nav Items

```
GET /api/nav-items
```

Public.

**Response (200):**

```json
{
  "navItems": [
    {
      "id": "nav_01jpyxcv3m7w4b8k2r5s9t1qfh",
      "type": "link",
      "label": "GitHub",
      "url": "https://github.com/...",
      "position": "a0",
      "createdAt": 1706000000,
      "updatedAt": 1706000000
    }
  ]
}
```

Types: `link` (custom URL) or `system` (built-in: RSS, Settings, Collections, Archive).

### Create Nav Item

```
POST /api/nav-items
```

**Auth required.**

```json
{
  "type": "link",
  "label": "GitHub",
  "url": "https://github.com/your-username"
}
```

### Update Nav Item

```
PUT /api/nav-items/:id
```

**Auth required.** All fields optional.

### Delete Nav Item

```
DELETE /api/nav-items/:id
```

**Auth required.** Response: `{ "success": true }`

---

## Settings

Base path: `/api/settings`

All settings endpoints require auth.

### Get Settings

```
GET /api/settings
```

Returns user-configurable settings (not environment-only fields).

**Response (200):**

```json
{
  "settings": {
    "SITE_NAME": "My Blog",
    "SITE_DESCRIPTION": "A personal microblog",
    "SITE_LANGUAGE": "en",
    "HOME_DEFAULT_VIEW": "latest",
    "MAIN_RSS_FEED": "featured",
    "HEADER_NAV_MAX_VISIBLE": "3",
    "TIME_ZONE": "UTC",
    "SITE_FOOTER": "",
    "NOINDEX": ""
  }
}
```

### Update Settings

```
PUT /api/settings
```

```json
{
  "SITE_NAME": "New Name",
  "SITE_DESCRIPTION": "Updated description"
}
```

Environment-only config keys (like `AUTH_SECRET`) are silently rejected. If all keys are rejected, returns `400`.

**Response (200):**

```json
{
  "settings": { "...": "updated values" },
  "rejectedKeys": ["SITE_ORIGIN", "SITE_PATH_PREFIX"]
}
```

`rejectedKeys` is only present if some keys were rejected.

---

## Other Endpoints

| Endpoint                      | Auth | Description                                                     |
| ----------------------------- | ---- | --------------------------------------------------------------- |
| `GET /health`                 | No   | Returns `{ "status": "ok" }`                                    |
| `GET /feed`                   | No   | RSS 2.0 canonical site feed (Featured by default, configurable) |
| `GET /feed/atom.xml`          | No   | Atom canonical site feed (Featured by default, configurable)    |
| `GET /feed/latest`            | No   | RSS 2.0 latest public posts feed (supports `?format=` filter)   |
| `GET /feed/latest/atom.xml`   | No   | Atom latest public posts feed (supports `?format=` filter)      |
| `GET /feed/featured`          | No   | RSS 2.0 featured posts feed                                     |
| `GET /feed/featured/atom.xml` | No   | Atom featured posts feed                                        |

Legacy aliases:

- `GET /feed/all` → `308` redirect to `/feed/latest`
- `GET /feed/all/atom.xml` → `308` redirect to `/feed/latest/atom.xml`

---

## Migration Guide

Step-by-step guide for migrating content from another blog to Jant.

### Prerequisites

1. A running Jant instance
2. An API token (see [Authentication](#api-tokens-recommended-for-scripts))

### Step 1: Create Collections (optional)

If your old blog has categories or tags, create corresponding collections first:

```bash
curl -X POST https://your-site.com/api/collections \
  -H "Authorization: Bearer jnt_YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"slug": "tech", "title": "Tech"}'
```

Save the returned `id` for each collection.

### Step 2: Upload Media

Upload each image/file before creating posts that reference them:

```bash
curl -X POST https://your-site.com/api/upload \
  -H "Authorization: Bearer jnt_YOUR_TOKEN" \
  -F "file=@/path/to/image.jpg"
```

Save the returned `id` for each uploaded file.

### Step 3: Create Posts

For each post from your old blog:

```bash
curl -X POST https://your-site.com/api/posts \
  -H "Authorization: Bearer jnt_YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "format": "note",
    "title": "My Old Blog Post",
    "bodyMarkdown": "Content from my old blog.\n\nSecond paragraph with **bold** text.",
    "slug": "my-old-blog-post",
    "status": "published",
    "publishedAt": 1609459200,
    "collectionIds": ["col_01jpyx5qds8y79w2dd6sv4rznj"],
    "attachments": [
      { "type": "media", "mediaId": "med_01jpyx4g9m8b4y50a4gx3t7p1n" },
      { "type": "media", "mediaId": "med_01jpyxd8hs5m3v7r1k9c2t4qgn" }
    ]
  }'
```

Key fields for migration:

- **`publishedAt`**: Set to the original publish date (Unix seconds) to preserve chronological order
- **`slug`**: Set to match the original URL path for link continuity
- **`collectionIds`**: Map old categories/tags to Jant collections
- **`attachments`**: Attach previously uploaded media in the order you want them to appear

### Step 4: Configure Site

```bash
curl -X PUT https://your-site.com/api/settings \
  -H "Authorization: Bearer jnt_YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"SITE_NAME": "My Blog", "SITE_DESCRIPTION": "Personal thoughts"}'
```

### Example Migration Script

A minimal Node.js script skeleton for migrating posts:

```javascript
const API_BASE = "https://your-site.com";
const TOKEN = "jnt_YOUR_TOKEN";

const headers = {
  Authorization: `Bearer ${TOKEN}`,
  "Content-Type": "application/json",
};

// Upload a file and return its ID
async function uploadFile(filePath) {
  const form = new FormData();
  const file = new Blob([await readFile(filePath)]);
  form.append("file", file, filePath.split("/").pop());

  const res = await fetch(`${API_BASE}/api/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}` },
    body: form,
  });
  const data = await res.json();
  return data.id;
}

// Create a post — bodyMarkdown is Markdown, the API handles conversion
async function createPost(post) {
  const res = await fetch(`${API_BASE}/api/posts`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      format: "note",
      title: post.title,
      bodyMarkdown: post.content, // Markdown string
      slug: post.slug,
      status: "published",
      publishedAt: Math.floor(new Date(post.date).getTime() / 1000),
      attachments: (post.mediaIds || []).map((mediaId) => ({
        type: "media",
        mediaId,
      })),
      collectionIds: post.collectionIds || [],
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    console.error(`Failed to create "${post.title}":`, err);
    return null;
  }
  return await res.json();
}

// Main migration loop
async function migrate(posts) {
  for (const post of posts) {
    const result = await createPost(post);
    if (result) {
      console.log(`Created: ${result.slug}`);
    }
  }
}
```

### Tips

- **Preserve dates**: Always set `publishedAt` to the original publish timestamp so posts appear in the correct chronological order.
- **Paths**: Use `path` to preserve original URLs. If your old blog used paths like `2024/01/my-post`, set `path` to `"2024/01/my-post"` — Jant will auto-generate a slug and register the original path as an alias. For simple slugs, use `slug` directly.
- **Rate yourself**: Add `rating` (1–5) if your old blog had review scores.
- **Threads**: To recreate comment chains or post series, create the root post first, then create replies with `replyToId` set to the root post's `id`.
- **Drafts**: Set `status: "draft"` for unpublished content. Drafts are not visible to visitors.
- **Idempotency**: The API doesn't have built-in idempotency. If your script crashes mid-migration, check which posts already exist (via `GET /api/posts`) before re-running.

---

## Export & Import

Jant has built-in site export and import for static publishing, offline inspection, and migration between instances.

### Export

Export your entire site as a [Zola](https://www.getzola.org/) static site in a ZIP file. The export includes posts, collections, thread structure, and Jant-specific metadata for round-trip import — you can build it into a standalone static site or import it into another Jant instance.

**From the dashboard:**

Go to **Settings > Account > Export Static Site** and click the button. Your browser will download `jant-export.zip`.

**From the API:**

```
POST /api/export/zola
```

**Auth required.**

```bash
curl -X POST https://your-site.com/api/export/zola \
  -H "Authorization: Bearer jnt_YOUR_TOKEN" \
  -o jant-export.zip
```

**From the CLI:**

```bash
# Export the local Node SQLite site
npx jant site export --output jant-export.zip

# Export a remote site
export JANT_API_TOKEN=jnt_YOUR_TOKEN
npx jant site export --url https://your-site.com --output jant-export.zip

# Export directly to a directory for theme debugging
npx jant site export --directory ./my-site
cd ./my-site
zola serve
```

Without `--url`, `jant site export` exports from the local Node SQLite runtime. With `--url`, it calls the authenticated export API. The CLI localizes referenced media into `static/media/` by default; pass `--no-localize-media` to keep original URLs. `jant export` remains available as a compatibility alias for database SQL export via `jant db export`.

For backup planning, see [Backups & Recovery](backups.md). The site export is useful for migration and archival, but it is not the same thing as a full database-and-storage disaster-recovery plan.

**What's in the ZIP:**

```
config.toml              # Zola site config
content/_index.md        # Root section
content/{slug}/index.md  # One file per post (threads merged)
content/c/{slug}/_index.md  # Collection title/description metadata for /c/{slug}/
templates/               # Zola templates (index, page, section, etc.)
static/style.css         # Theme CSS (dark mode included)
static/favicon.ico      # Exported favicon (custom or default fallback)
static/apple-touch-icon.png # Exported Apple touch icon (custom or default fallback)
```

- Threads are merged: the root post and all replies appear in one file, separated by `<!-- jant:reply ... -->` marker comments
- Reply URLs become Zola `aliases` so existing links still work
- True root aliases are exported separately under `extra.jant.root_aliases` for round-trip import
- The raw export API only writes content files. The CLI localizes media by default unless you pass `--no-localize-media`
- Attachments are preserved as `data-jant-node="attachments"` HTML blocks for re-import
- Rich image blocks preserve Jant-only attributes such as caption, link target, and layout
- Collections are exported as Zola taxonomies under `/c/`
- Collection display titles and descriptions are exported via `content/c/{slug}/_index.md`
- A static `/archive/` page is exported so archive nav items still work in Zola
- `config.toml` includes `[extra.jant_export]` metadata so importers can recognize the export format version
- `config.toml` also records `site_avatar_mode`, `favicon_mode`, and `apple_touch_mode` so `jant site import` can distinguish exported defaults from custom uploaded assets

**Building the static site:**

```bash
unzip jant-export.zip -d my-site
cd my-site
zola build    # Output in public/
zola serve    # Preview at http://127.0.0.1:1111
```

### Import

Restore an export ZIP into a Jant instance using the CLI:

```bash
export JANT_API_TOKEN=jnt_YOUR_TOKEN
npx jant site import --url https://your-site.com --path ./export
```

Without `--url`, `jant site import` imports into the local Node SQLite runtime. With `--url`, it imports into a remote site and requires `JANT_API_TOKEN` (unless using `--dry-run`). `jant import-site` remains available as a compatibility alias.

The importer is designed for strict restore into an empty target site. If a collection slug, post slug, reply slug, or alias is already in use, the import stops with a conflict instead of skipping records.

**Authentication:** Set the `JANT_API_TOKEN` environment variable for remote imports. This avoids exposing the token in shell history or process lists.

**Options:**

| Flag           | Required | Default           | Description                                 |
| -------------- | -------- | ----------------- | ------------------------------------------- |
| `--url`        | no       | local runtime     | Target Jant instance URL                    |
| `--path`       | no       | `.` (current dir) | Path to export directory or ZIP file        |
| `--dry-run`    | no       | `false`           | Parse and validate without making API calls |
| `--skip-media` | no       | `false`           | Skip downloading and re-uploading media     |
| `-h, --help`   | no       | —                 | Show usage information                      |

**What it does:**

1. Reads and unzips the export file
2. Creates collections from the ZIP's taxonomy data
3. Creates posts with original titles, slugs, dates, formats, and ratings
4. Recreates threads by creating replies with `replyToId`
5. Downloads images referenced in Markdown and re-uploads them to the target site
6. Reports a summary of what was created

**Example — dry run first:**

```bash
# Preview what would be imported (no changes made)
npx jant site import \
  --url https://new-site.com \
  --path ./jant-export \
  --dry-run
```

**Example — import from a directory:**

```bash
export JANT_API_TOKEN=jnt_YOUR_TOKEN

# Unzip first, inspect content, then import
unzip jant-export.zip -d jant-export
npx jant site import \
  --url https://new-site.com \
  --path ./jant-export
```

**Example — import from a ZIP directly:**

```bash
export JANT_API_TOKEN=jnt_YOUR_TOKEN
npx jant site import \
  --url https://new-site.com \
  --path jant-export.zip
```

**Example — fast import without images:**

```bash
export JANT_API_TOKEN=jnt_YOUR_TOKEN
npx jant site import \
  --url https://new-site.com \
  --skip-media
```

**Tips:**

- Always do a `--dry-run` first to check for parsing errors
- The import is not idempotent — running it twice creates duplicate posts
- Use `--skip-media` for faster imports when the original site will stay online
- The target instance must have API tokens enabled (create one at **Settings > API Tokens**)

---

## Rate Limiting

No rate limiting is currently enforced. This may change in future versions.

## Versioning

The API is unversioned. Breaking changes will be communicated in release notes.
