# Jant API Reference

REST API for programmatic access to your Jant microblog. Use it to publish
posts, upload media, manage collections, and migrate content from other
platforms.

**Base URL:** `https://your-site.com`

All endpoints return JSON. Timestamps are Unix seconds (not milliseconds).

---

## Authentication

Read-only endpoints (GET) are public. All write operations (POST, PUT, DELETE)
require authentication.

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

Tokens grant full API access (equivalent to session auth). Store them securely.
You can revoke a token anytime from Settings > API Tokens.

### Session Cookies

Sign in via the web UI at `/signin`. The session cookie is automatically
included in browser requests.

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

The `details` field is only present for validation errors and contains
field-level messages.

| Code                     | HTTP Status | Meaning                               |
| ------------------------ | ----------- | ------------------------------------- |
| `VALIDATION_ERROR`       | 400         | Invalid input                         |
| `UNAUTHORIZED`           | 401         | Missing or invalid auth               |
| `FORBIDDEN`              | 403         | Not allowed                           |
| `NOT_FOUND`              | 404         | Resource doesn't exist                |
| `CONFLICT`               | 409         | Slug conflict or constraint violation |
| `RATE_LIMIT`             | 429         | Too many requests                     |
| `EXTERNAL_SERVICE_ERROR` | 500         | Internal failure                      |

All ID parameters must be valid UUIDs. Invalid IDs return `400`.

---

## Posts

Base path: `/api/posts`

Jant has three post formats:

| Format  | Purpose                                                  | Key fields                                   |
| ------- | -------------------------------------------------------- | -------------------------------------------- |
| `note`  | Original content (short thoughts, long articles, images) | `bodyMarkdown`, `title` (optional)           |
| `link`  | Shared reference (articles, tools, videos)               | `url` (important), `bodyMarkdown` (optional) |
| `quote` | Cited text (book excerpts, quotes)                       | `quoteText`, `url` (optional source)         |

### List Posts

```
GET /api/posts
```

Public. No auth required.

**Query parameters:**

| Parameter | Type                        | Default     | Description                                                      |
| --------- | --------------------------- | ----------- | ---------------------------------------------------------------- |
| `format`  | `note` \| `link` \| `quote` | all         | Filter by format                                                 |
| `status`  | `draft` \| `published`      | `published` | Filter by status                                                 |
| `cursor`  | string (UUID)               | —           | Cursor for pagination (pass `nextCursor` from previous response) |
| `limit`   | integer                     | `100`       | Posts per page                                                   |

**Response (200):**

```json
{
  "posts": [
    {
      "id": "019513a2-b3c4-7d5e-8f6a-1b2c3d4e5f6a",
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
      "mediaAttachments": [
        {
          "id": "019513a2-...",
          "url": "/media/2025/01/019513a2.jpg",
          "previewUrl": "/media/2025/01/019513a2.jpg",
          "posterUrl": null,
          "alt": null,
          "blurhash": null,
          "width": 800,
          "height": 600,
          "position": 0,
          "mimeType": "image/jpeg",
          "summary": null
        }
      ]
    }
  ],
  "nextCursor": "019513a2-b3c4-7d5e-..."
}
```

`nextCursor` is `null` when there are no more pages.

### Get Post

```
GET /api/posts/:id
```

Public. Returns the full post with `collectionIds` and `mediaAttachments`.

**Response (200):**

```json
{
  "id": "019513a2-...",
  "format": "note",
  "collectionIds": ["019513b1-...", "019513b2-..."],
  "mediaAttachments": [],
  "...": "same fields as list"
}
```

### Create Post

```
POST /api/posts
```

**Auth required.**

**Request body (JSON):**

```json
{
  "format": "note",
  "title": "My First Post",
  "bodyMarkdown": "Hello world!\n\nThis is **bold** and *italic* text.",
  "status": "published",
  "visibility": "public",
  "publishedAt": 1706000000,
  "slug": "my-first-post",
  "collectionIds": ["collection-uuid"],
  "mediaIds": ["media-uuid-1", "media-uuid-2"]
}
```

**Fields:**

| Field           | Type                                | Required | Default     | Description                                                                                                                                                                                                  |
| --------------- | ----------------------------------- | -------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `format`        | `note` \| `link` \| `quote`         | **yes**  | —           | Post format                                                                                                                                                                                                  |
| `title`         | string                              | no       | —           | Post title. Notes with titles render as articles                                                                                                                                                             |
| `body`          | string                              | no       | —           | Post content as TipTap JSON (used by the editor UI)                                                                                                                                                          |
| `bodyMarkdown`  | string                              | no       | —           | Post content in Markdown (see [Body Format](#body-format))                                                                                                                                                   |
| `slug`          | string                              | no       | auto        | URL slug. Auto-generated from title or as random ID. Mutually exclusive with `path`                                                                                                                          |
| `path`          | string                              | no       | —           | Custom URL path (without leading `/`). If the path is a valid slug, it's used directly; otherwise it's slugified for the URL and the original path is registered as an alias. Mutually exclusive with `slug` |
| `status`        | `draft` \| `published`              | no       | `published` |                                                                                                                                                                                                              |
| `visibility`    | `public` \| `unlisted` \| `private` | no       | `public`    |                                                                                                                                                                                                              |
| `pinned`        | boolean                             | no       | `false`     | Pin to top of timeline (max 3)                                                                                                                                                                               |
| `featured`      | boolean                             | no       | `false`     | Mark as featured content                                                                                                                                                                                     |
| `url`           | string (URL)                        | no       | —           | Link URL (for `link` format) or source URL (for `quote`)                                                                                                                                                     |
| `quoteText`     | string                              | no       | —           | Quoted text (for `quote` format)                                                                                                                                                                             |
| `rating`        | integer (1–5)                       | no       | —           | Rating score                                                                                                                                                                                                 |
| `collectionIds` | string[]                            | no       | —           | Collection UUIDs to add the post to                                                                                                                                                                          |
| `replyToId`     | string (UUID)                       | no       | —           | Create as a reply in a thread                                                                                                                                                                                |
| `publishedAt`   | integer                             | no       | now         | Unix timestamp in seconds                                                                                                                                                                                    |
| `mediaIds`      | string[]                            | no       | —           | Media UUIDs to attach (max 20). Upload files first via `/api/upload`                                                                                                                                         |

**Slug rules:**

- Lowercased, only `a-z`, `0-9`, and hyphens
- Auto-generated from `title` if omitted, or as a random short ID
- Must be unique across all posts and custom URLs
- Slug conflicts return `409 Conflict`

**Thread behavior:**

- Setting `replyToId` makes this post a reply in an existing thread
- Replies inherit `status` and `visibility` from the thread root

**Response (201):** Full post object with `mediaAttachments`.

### Update Post

```
PUT /api/posts/:id
```

**Auth required.** All fields are optional (partial update).

```json
{
  "title": "Updated Title",
  "bodyMarkdown": "Updated content in **Markdown**."
}
```

**Media behavior:**

- Omitting `mediaIds` → keeps existing attachments
- `"mediaIds": []` → removes all attachments
- `"mediaIds": ["new-id"]` → replaces all attachments

**Response (200):** Updated post with `mediaAttachments`.

### Delete Post

```
DELETE /api/posts/:id
```

**Auth required.** Soft-deletes the post. If it's a thread root, all replies are
also deleted. Associated media files are permanently removed from storage.

**Response (200):**

```json
{ "success": true }
```

---

## Body Format

Post content can be provided in two ways — use one or the other, not both:

- **`bodyMarkdown`** — Markdown string. The server converts it to the internal
  document format and renders HTML (`bodyHtml`) and plain text (`bodyText`).
  **Recommended for API users and scripts.**
- **`body`** — TipTap JSON string. Used by the built-in editor UI. Only use this
  if you are working with the TipTap document format directly.

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
This is **bold** and _italic_ text. Use `inline code` for code snippets. This is
~~strikethrough~~ text.
```

### Links

```markdown
[click here](https://example.com)
```

### Images

```markdown
![Alt text](https://example.com/image.png)
```

For media attachments, use the `/api/upload` endpoint and `mediaIds` instead.

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

The API response includes two rendered fields derived from
`body`/`bodyMarkdown`:

- **`bodyHtml`** — HTML rendering of the content. Use this for display.
- **`bodyText`** — Plain text extraction. Use this for search indexing or
  previews.

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

**File limits:** Configurable via `UPLOAD_MAX_FILE_SIZE_MB` env var (default:
500 MB). All MIME types accepted.

**Response (200):**

```json
{
  "id": "019513a2-b3c4-7d5e-8f6a-1b2c3d4e5f6a",
  "filename": "019513a2.jpg",
  "url": "/media/2025/01/019513a2.jpg",
  "mimeType": "image/jpeg",
  "size": 1024000
}
```

Save the `id` — you'll need it to attach the file to a post via `mediaIds`.

Example:

```bash
# Upload an image
curl -X POST https://your-site.com/api/upload \
  -H "Authorization: Bearer jnt_YOUR_TOKEN" \
  -F "file=@photo.jpg"

# Response: {"id": "019513a2-...", "url": "/media/2025/01/019513a2.jpg", ...}
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
      "id": "019513a2-...",
      "filename": "019513a2.jpg",
      "url": "/media/2025/01/019513a2.jpg",
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

Collections organize posts by topic (e.g. "Books", "Tools", "Movies"). A post
can belong to multiple collections. Collection pages are available at
`/c/{slug}`.

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
      "id": "019513b1-...",
      "slug": "reading",
      "title": "Reading",
      "description": "Books I've read",
      "icon": null,
      "sortOrder": "newest",
      "createdAt": 1706000000,
      "updatedAt": 1706000000,
      "postCount": 12
    }
  ],
  "sidebarItems": [
    {
      "id": "019513c1-...",
      "type": "collection",
      "collectionId": "019513b1-...",
      "position": "a0",
      "createdAt": 1706000000,
      "updatedAt": 1706000000
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
  "icon": "📚",
  "sortOrder": "newest"
}
```

| Field         | Type   | Required | Default  | Description                                           |
| ------------- | ------ | -------- | -------- | ----------------------------------------------------- |
| `slug`        | string | **yes**  | —        | URL slug (same rules as post slugs)                   |
| `title`       | string | **yes**  | —        | Collection name                                       |
| `description` | string | no       | —        | Description text                                      |
| `icon`        | string | no       | —        | Emoji or icon identifier                              |
| `sortOrder`   | string | no       | `newest` | `newest` \| `oldest` \| `rating_desc` \| `rating_asc` |

**Response (201):** Created collection object.

### Update Collection

```
PUT /api/collections/:id
```

**Auth required.** All fields optional. Set `description` or `icon` to `null` to
clear.

### Delete Collection

```
DELETE /api/collections/:id
```

**Auth required.** Deletes the collection. Posts in the collection are NOT
deleted.

**Response (200):** `{ "success": true }`

### Add Post to Collection

```
POST /api/collections/:id/posts
```

**Auth required.**

```json
{ "postId": "019513a2-..." }
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

Custom URLs let you create aliases for posts/collections or set up redirects —
useful for blog migration (e.g. mapping old paths like `/blog/2024/my-post` to a
Jant post).

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

Public. Results are sorted by creation date (newest first) and paginated using
`DEFAULT_PAGE_SIZE` (100 items per page).

**Query parameters:**

| Parameter | Type    | Required | Default | Description |
| --------- | ------- | -------- | ------- | ----------- |
| `page`    | integer | no       | `1`     | Page number |

**Response (200):**

```json
{
  "customUrls": [
    {
      "id": "019513e1-...",
      "path": "blog/old-post",
      "targetType": "redirect",
      "targetId": null,
      "toPath": "/my-new-slug",
      "redirectType": 301,
      "createdAt": 1706000000
    },
    {
      "id": "019513e2-...",
      "path": "2024/01/hello",
      "targetType": "post",
      "targetId": "019513a2-...",
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

Create an alias for a post (visitor sees `/essays/on-writing` but the post lives
at `/on-writing`):

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
      "id": "019513a2-...",
      "format": "note",
      "title": "Hello World",
      "slug": "hello-world",
      "snippet": "...matched <mark>hello</mark> text...",
      "publishedAt": 1706000000,
      "url": "/hello-world"
    }
  ],
  "count": 1
}
```

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
      "id": "019513d1-...",
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

Types: `link` (custom URL) or `system` (built-in: RSS, Settings, Collections,
Archive).

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

Environment-only keys (like `AUTH_SECRET`) are silently rejected. If all keys
are rejected, returns `400`.

**Response (200):**

```json
{
  "settings": { "...": "updated values" },
  "rejectedKeys": ["SITE_URL"]
}
```

`rejectedKeys` is only present if some keys were rejected.

---

## Other Endpoints

| Endpoint                 | Auth | Description                                                    |
| ------------------------ | ---- | -------------------------------------------------------------- |
| `GET /health`            | No   | Returns `{ "status": "ok" }`                                   |
| `GET /feed`              | No   | RSS 2.0 feed (featured posts only)                             |
| `GET /feed/atom.xml`     | No   | Atom feed (featured posts only)                                |
| `GET /feed/all`          | No   | RSS 2.0 feed (all published posts, supports `?format=` filter) |
| `GET /feed/all/atom.xml` | No   | Atom feed (all published posts)                                |

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
    "collectionIds": ["collection-uuid"],
    "mediaIds": ["media-uuid-1", "media-uuid-2"]
  }'
```

Key fields for migration:

- **`publishedAt`**: Set to the original publish date (Unix seconds) to preserve
  chronological order
- **`slug`**: Set to match the original URL path for link continuity
- **`collectionIds`**: Map old categories/tags to Jant collections
- **`mediaIds`**: Attach previously uploaded media

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
      mediaIds: post.mediaIds || [],
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

- **Preserve dates**: Always set `publishedAt` to the original publish timestamp
  so posts appear in the correct chronological order.
- **Paths**: Use `path` to preserve original URLs. If your old blog used paths
  like `2024/01/my-post`, set `path` to `"2024/01/my-post"` — Jant will
  auto-generate a slug and register the original path as an alias. For simple
  slugs, use `slug` directly.
- **Rate yourself**: Add `rating` (1–5) if your old blog had review scores.
- **Threads**: To recreate comment chains or post series, create the root post
  first, then create replies with `replyToId` set to the root post's `id`.
- **Drafts**: Set `status: "draft"` for unpublished content. Drafts are not
  visible to visitors.
- **Idempotency**: The API doesn't have built-in idempotency. If your script
  crashes mid-migration, check which posts already exist (via `GET /api/posts`)
  before re-running.

---

## Export & Import

Jant has built-in export and import for full site backup and migration between
instances.

### Export

Export your entire site as a [Zola](https://www.getzola.org/) static site in a
ZIP file. The export includes all published posts, collections, threads (merged
into single pages), and a complete Zola theme — you can build it into a
standalone static site or import it into another Jant instance.

**From the dashboard:**

Go to **Settings > Account > Export Site** and click the button. Your browser
will download `jant-export.zip`.

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

**What's in the ZIP:**

```
config.toml              # Zola site config
content/_index.md        # Root section
content/{slug}/index.md  # One file per post (threads merged)
templates/               # Zola templates (index, page, section, etc.)
static/style.css         # Theme CSS (dark mode included)
```

- Threads are merged: the root post and all replies appear in one file,
  separated by `<!-- jant:reply ... -->` marker comments
- Reply URLs become Zola `aliases` so existing links still work
- Media URLs point to the original site (files are not copied into the ZIP)
- Collections are exported as Zola taxonomies under `/c/`

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
export JANT_TOKEN=jnt_YOUR_TOKEN
npx jant import-site --url https://your-site.com
```

**Authentication:** Set the `JANT_TOKEN` environment variable. This avoids
exposing the token in shell history or process lists.

**Options:**

| Flag           | Required | Default           | Description                                 |
| -------------- | -------- | ----------------- | ------------------------------------------- |
| `--url`        | **yes**  | —                 | Target Jant instance URL                    |
| `--path`       | no       | `.` (current dir) | Path to export directory or ZIP file        |
| `--dry-run`    | no       | `false`           | Parse and validate without making API calls |
| `--skip-media` | no       | `false`           | Skip downloading and re-uploading images    |
| `-h, --help`   | no       | —                 | Show usage information                      |

**What it does:**

1. Reads and unzips the export file
2. Creates collections from the ZIP's taxonomy data
3. Creates posts with original titles, slugs, dates, formats, and ratings
4. Recreates threads by creating replies with `replyToId`
5. Downloads images referenced in Markdown and re-uploads them to the target
   site
6. Reports a summary of what was created

**Example — dry run first:**

```bash
# Preview what would be imported (no changes made)
npx jant import-site \
  --url https://new-site.com \
  --path ./jant-export \
  --dry-run
```

**Example — import from a directory:**

```bash
export JANT_TOKEN=jnt_YOUR_TOKEN

# Unzip first, inspect content, then import
unzip jant-export.zip -d jant-export
npx jant import-site \
  --url https://new-site.com \
  --path ./jant-export
```

**Example — import from a ZIP directly:**

```bash
export JANT_TOKEN=jnt_YOUR_TOKEN
npx jant import-site \
  --url https://new-site.com \
  --path jant-export.zip
```

**Example — fast import without images:**

```bash
export JANT_TOKEN=jnt_YOUR_TOKEN
npx jant import-site \
  --url https://new-site.com \
  --skip-media
```

**Tips:**

- Always do a `--dry-run` first to check for parsing errors
- The import is not idempotent — running it twice creates duplicate posts
- Use `--skip-media` for faster imports when the original site will stay online
- The target instance must have API tokens enabled (create one at **Settings >
  API Tokens**)

---

## Rate Limiting

No rate limiting is currently enforced. This may change in future versions.

## Versioning

The API is unversioned. Breaking changes will be communicated in release notes.
