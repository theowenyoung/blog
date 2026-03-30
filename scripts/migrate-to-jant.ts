#!/usr/bin/env -S deno run --allow-read --allow-net --allow-env --allow-write --unsafely-ignore-certificate-errors

/**
 * Migrate content/blog/ posts to Jant microblog.
 *
 * Usage:
 *   deno run --allow-all --unsafely-ignore-certificate-errors scripts/migrate-to-jant.ts            # 2 per type (default)
 *   deno run --allow-all --unsafely-ignore-certificate-errors scripts/migrate-to-jant.ts --all      # migrate everything
 *   deno run --allow-all --unsafely-ignore-certificate-errors scripts/migrate-to-jant.ts --limit=5  # 5 per type
 *   deno run --allow-all --unsafely-ignore-certificate-errors scripts/migrate-to-jant.ts --type=note|link|quote
 *   deno run --allow-all --unsafely-ignore-certificate-errors scripts/migrate-to-jant.ts --dry-run  # preview only
 *
 * Post type mapping:
 *   content/blog/quotes/   → Jant format=quote  (no explicit path)
 *   content/blog/links/    → Jant format=link   (preserve blog path via `path`)
 *   content/blog/thoughts/ → Jant format=note   (no explicit path)
 *   everything else        → Jant format=note   (preserve blog path via `path`)
 *
 * State is kept in memory for the current run only.
 */

import "jsr:@std/dotenv/load";
import { parse as parseYaml } from "jsr:@std/yaml";
import { walk } from "jsr:@std/fs/walk";
import { basename, dirname, join, relative } from "jsr:@std/path";

// ─────────────────────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────────────────────

const JANT_BASE_URL = Deno.env.get("JANT_BASE_URL") ??
  "https://jant.localtest.me";
const JANT_DEV_API_TOKEN = Deno.env.get("JANT_DEV_API_TOKEN");
if (!JANT_DEV_API_TOKEN) {
  console.error("❌  JANT_DEV_API_TOKEN not set in .env");
  Deno.exit(1);
}

const BLOG_DIR = "content/blog";
// const STATE_FILE = "temp-state.json";
const DEFAULT_LIMIT = 2;

const args = Deno.args;
const flagAll = args.includes("--all");
const flagDryRun = args.includes("--dry-run");
const limitArg = args.find((a) => a.startsWith("--limit="));
const typeArg = args.find((a) => a.startsWith("--type="));

const LIMIT = flagAll
  ? Infinity
  : limitArg
  ? parseInt(limitArg.split("=")[1], 10)
  : DEFAULT_LIMIT;
const ONLY_TYPE = typeArg?.split("=")[1] as PostFormat | undefined;

const AUTH = { Authorization: `Bearer ${JANT_DEV_API_TOKEN}` } as Record<
  string,
  string
>;
const JSON_HDRS = { ...AUTH, "Content-Type": "application/json" };

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type PostFormat = "note" | "link" | "quote";
type PostSubtype = "note" | "thought" | "link" | "quote";
type CollectionSortOrder = "newest" | "oldest" | "rating_desc";
type SidebarItemType = "collection" | "divider" | "link";

interface CollectionSidebarItemSpec {
  type: "collection";
  slug: string;
  title: string;
  sortOrder?: CollectionSortOrder;
  legacySlugs?: string[];
}

interface LinkSidebarItemSpec {
  type: "link";
  label: string;
  url: string;
}

type SidebarLayoutItemSpec = CollectionSidebarItemSpec | LinkSidebarItemSpec;

interface SidebarSectionSpec {
  label: string;
  items: SidebarLayoutItemSpec[];
}

interface MigratedEntry {
  sourcePath: string;
  jantId: string;
  jantSlug: string;
  format: PostFormat;

  migratedAt: string;
  status: "success" | "error";
  error?: string;
}

interface State {
  migrated: Record<string, MigratedEntry>;
  lastRun: string;
}

interface ThreadState {
  rootId: string;
  rootPath: string;
}

interface JantCollection {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  sortOrder: CollectionSortOrder;
  createdAt: number;
  updatedAt: number;
}

interface JantSidebarItem {
  id: string;
  type: SidebarItemType;
  collectionId: string | null;
  label: string | null;
  url: string | null;
  position: string;
  createdAt: number;
  updatedAt: number;
}

interface CollectionsIndexResponse {
  collections: JantCollection[];
  sidebarItems?: JantSidebarItem[];
  directoryItems?: JantSidebarItem[];
}

const SIDEBAR_LAYOUT: SidebarSectionSpec[] = [
  {
    label: "Mine",
    items: [
      {
        type: "link",
        label: "Thoughts",
        url: "/archive?format=note&hasTitle=0&visibility=public&view=list",
      },
      {
        type: "link",
        label: "Posts",
        url: "/archive?format=note&hasTitle=1&visibility=public&view=list",
      },
      {
        type: "collection",
        slug: "photos",
        title: "Photos",
        legacySlugs: ["mine-photos"],
      },
      {
        type: "collection",
        slug: "projects",
        title: "Projects",
        legacySlugs: ["mine-projects"],
      },
      {
        type: "collection",
        slug: "uses",
        title: "What I Use",
        legacySlugs: ["mine-what-i-use"],
      },
      {
        type: "collection",
        slug: "wishlist",
        title: "Wishlist",
        legacySlugs: ["mine-wishlist"],
      },
    ],
  },
  {
    label: "Inspirations",
    items: [
      {
        type: "collection",
        slug: "products",
        title: "Products",
        legacySlugs: ["inspirations-products"],
      },
      {
        type: "collection",
        slug: "links",
        title: "Inspired Links",
        legacySlugs: ["inspirations-inspired-links"],
      },
      {
        type: "collection",
        slug: "design",
        title: "Design",
        legacySlugs: ["inspirations-design"],
      },
      {
        type: "collection",
        slug: "tools",
        title: "Tools",
        legacySlugs: ["reference-tools"],
      },
      {
        type: "collection",
        slug: "sources",
        title: "Sources",
        legacySlugs: ["reference-sources"],
      },
      {
        type: "collection",
        slug: "communities",
        title: "Communities",
      },
      {
        type: "collection",
        slug: "awesome",
        title: "Awesome Lists",
        legacySlugs: ["reference-awesome-lists"],
      },
    ],
  },
  {
    label: "Content",
    items: [
      {
        type: "collection",
        slug: "articles",
        title: "Articles",
        legacySlugs: ["content-articles"],
      },
      {
        type: "link",
        label: "Quotes",
        url: "/archive?format=quote&visibility=public&view=list",
      },
      {
        type: "collection",
        slug: "videos",
        title: "Videos",
        legacySlugs: ["content-videos"],
      },
      {
        type: "collection",
        slug: "podcasts",
        title: "Podcasts",
        legacySlugs: ["content-podcasts"],
      },
      {
        type: "collection",
        slug: "ai-answers",
        title: "AI Answers",
        legacySlugs: ["answers", "content-ai-answers"],
      },
    ],
  },
  {
    label: "Entertainment",
    items: [
      {
        type: "collection",
        slug: "books",
        title: "Books",
        legacySlugs: ["entertainment-books"],
      },
      {
        type: "collection",
        slug: "film-tv",
        title: "Film & TV",
        legacySlugs: ["entertainment-film-tv"],
      },
      {
        type: "collection",
        slug: "music",
        title: "Music",
        legacySlugs: ["entertainment-music"],
      },
      {
        type: "collection",
        slug: "lol",
        title: "LOL",
        legacySlugs: ["entertainment-lol"],
      },
    ],
  },
  {
    label: "Areas",
    items: [
      {
        type: "collection",
        slug: "ui",
        title: "UI Design",
        legacySlugs: ["areas-ui-design"],
      },
      {
        type: "collection",
        slug: "alternatives",
        title: "Alternatives",
      },
      {
        type: "collection",
        slug: "english",
        title: "Learning English",
      },
    ],
  },
];

const OBSOLETE_COLLECTION_SIDEBAR_SLUGS = [
  "mine-posts",
  "mine-thoughts",
  "resources",
  "learning",
  "reference-resources",
  "reference-learning",
];
const OBSOLETE_DIVIDER_LABELS = ["Reference"];

// ─────────────────────────────────────────────────────────────────────────────
// State management
// ─────────────────────────────────────────────────────────────────────────────

async function loadState(): Promise<State> {
  // temp-state.json persistence is disabled for now.
  // try {
  //   return JSON.parse(await Deno.readTextFile(STATE_FILE));
  // } catch {
  //   return { migrated: {}, lastRun: "" };
  // }
  return { migrated: {}, lastRun: "" };
}

async function saveState(_state: State): Promise<void> {
  // temp-state.json persistence is disabled for now.
  // state.lastRun = new Date().toISOString();
  // await Deno.writeTextFile(STATE_FILE, JSON.stringify(state, null, 2));
}

// ─────────────────────────────────────────────────────────────────────────────
// File scanning
// ─────────────────────────────────────────────────────────────────────────────

async function scanBlogFiles(): Promise<string[]> {
  const files: string[] = [];
  for await (
    const entry of walk(BLOG_DIR, {
      exts: ["md"],
      includeDirs: false,
    })
  ) {
    if (/\/_index(\.en)?\.md$/.test(entry.path)) continue;
    files.push(entry.path);
  }
  return files.sort();
}

// ─────────────────────────────────────────────────────────────────────────────
// Frontmatter parsing
// ─────────────────────────────────────────────────────────────────────────────

function parseFrontmatter(content: string): {
  meta: Record<string, unknown>;
  body: string;
} {
  const m = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { meta: {}, body: content.trim() };
  let meta: Record<string, unknown> = {};
  try {
    meta = (parseYaml(m[1]) as Record<string, unknown>) ?? {};
  } catch {
    /* ignore */
  }
  return { meta, body: m[2].trim() };
}

// ─────────────────────────────────────────────────────────────────────────────
// Classification & slug helpers
// ─────────────────────────────────────────────────────────────────────────────

function classify(relPath: string): {
  format: PostFormat;
  subtype: PostSubtype;
} {
  if (relPath.startsWith("quotes/")) {
    return { format: "quote", subtype: "quote" };
  }
  if (relPath.startsWith("links/")) return { format: "link", subtype: "link" };
  if (relPath.startsWith("thoughts/")) {
    return { format: "note", subtype: "thought" };
  }
  return { format: "note", subtype: "note" };
}

/**
 * Convert relPath → custom URL path (no leading slash).
 * e.g. "books/12-rules-for-life.md" → "blog/books/12-rules-for-life"
 */
function toCustomPath(relPath: string): string {
  return ("blog/" + relPath)
    .replace(/\.en\.md$/, "-en")
    .replace(/\.md$/, "")
    .replace(/\/index$/, "");
}

function resolveCollectionSlugs(relPath: string): string[] {
  if (relPath.startsWith("links/")) return ["articles"];
  if (relPath.startsWith("books/")) return ["books"];
  return [];
}

// ─────────────────────────────────────────────────────────────────────────────
// Markdown processing
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Pre-process markdown before sending to Jant:
 * 1. Upload local images, replace their paths with Jant URLs
 * 2. Convert Zola internal links (@/path.md, /content/path.md) → relative paths
 * 3. Normalize <!-- more --> → <!--more--> (Jant native read-more marker)
 */
async function processMarkdown(
  md: string,
  postFile: string,
): Promise<string> {
  let result = md;
  const seen = new Set<string>();

  // ── 1. Upload local images and replace URLs ─────────────────────────────
  for (const m of md.matchAll(/!\[([^\]]*)\]\(([^)]+)\)/g)) {
    const src = m[2].trim();
    if (seen.has(src)) continue;
    seen.add(src);

    // Skip external URLs
    if (/^https?:\/\/|^\/\//.test(src)) continue;

    const localPath = src.startsWith("/")
      ? join("static", src)
      : join(dirname(postFile), src);

    try {
      await Deno.stat(localPath);
    } catch {
      console.warn(`  ⚠️   Image not found: ${localPath}`);
      continue;
    }

    if (flagDryRun) {
      console.log(`  [dry-run] Would upload: ${localPath}`);
      continue;
    }

    const uploaded = await uploadFile(localPath);
    if (uploaded) {
      const jantUrl = new URL(uploaded.url, JANT_BASE_URL).toString();
      // Preserve original alt text while replacing every image occurrence for this src.
      result = result.replace(
        new RegExp(`!\\[([^\\]]*)\\]\\(${escapeRegExp(src)}\\)`, "g"),
        (_full, currentAlt) => `![${currentAlt}](${jantUrl})`,
      );
      console.log(`  📷  Uploaded: ${basename(localPath)} → ${jantUrl}`);
    }
  }

  // ── 2. Convert Zola internal links to relative paths ────────────────────
  // [text](@/blog/actionsflow.md)  →  [text](/blog/actionsflow)
  // [text](/content/blog/foo.md)   →  [text](/blog/foo)
  result = result.replace(
    /\[([^\]]*)\]\((@\/[^)]+|\/content\/[^)]+)\)/g,
    (_full, text, href) => {
      let newHref: string;
      if (href.startsWith("@/")) {
        newHref = "/" +
          href
            .slice(2)
            .replace(/\.md$/, "")
            .replace(/\/index$/, "");
      } else {
        newHref = "/" +
          href
            .slice("/content/".length)
            .replace(/\.md$/, "")
            .replace(/\/index$/, "");
      }
      return `[${text}](${newHref})`;
    },
  );

  // ── 3. Normalize read-more separator ────────────────────────────────────
  // Zola uses <!-- more -->, Jant uses <!--more-->
  result = result.replace(/<!--\s*more\s*-->/g, "<!--more-->");

  return result;
}

async function uploadFile(
  path: string,
): Promise<{ id: string; url: string } | null> {
  try {
    const fd = new FormData();
    fd.append("file", new Blob([await Deno.readFile(path)]), basename(path));
    const r = await fetch(`${JANT_BASE_URL}/api/upload`, {
      method: "POST",
      headers: AUTH,
      body: fd,
    });
    if (!r.ok) {
      const txt = await r.text().catch(() => "");
      console.warn(
        `  ⚠️   Upload ${basename(path)} failed: ${r.status} ${
          txt.slice(
            0,
            100,
          )
        }`,
      );
      return null;
    }
    return r.json();
  } catch (e) {
    console.warn(`  ⚠️   Upload error ${path}: ${(e as Error).message}`);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function isValidUrl(url: string | undefined): url is string {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeOptionalString(value: unknown): string | undefined {
  if (value == null) return undefined;
  const normalized = String(value).trim();
  return normalized ? normalized : undefined;
}

function normalizeOptionalUrl(value: unknown): string | undefined {
  const normalized = normalizeOptionalString(value)?.replace(
    /^[`"'“”]+|[`"'“”]+$/g,
    "",
  );
  return isValidUrl(normalized) ? normalized : undefined;
}

function normalizeOptionalInteger(value: unknown): number | undefined {
  if (value == null || value === "") return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return undefined;
  return Math.trunc(parsed);
}

function isSuspiciousQuoteSourceName(value: string): boolean {
  const normalized = value.trim();
  return normalized.length > 120 ||
    /[\r\n]/.test(normalized) ||
    /[。；;]/.test(normalized);
}

function normalizeQuoteSourceName(
  value: string | undefined,
): string | undefined {
  if (!value) return undefined;
  return isSuspiciousQuoteSourceName(value) ? undefined : value;
}

function stripTrailingQuoteAttribution(
  body: string,
  sourceName: string | undefined,
): string {
  let result = body.replace(/\r\n/g, "\n").trim();
  if (!sourceName) return result;

  const escapedSource = escapeRegExp(sourceName.trim());
  const separator = String.raw`[-—–─―]+`;
  const patterns = [
    new RegExp(String.raw`\s+${separator}\s*${escapedSource}\s*$`),
    new RegExp(String.raw`\s*${separator}\s*\n${escapedSource}\s*$`),
    new RegExp(String.raw`\s*\n${separator}\s*\n${escapedSource}\s*$`),
  ];

  for (const pattern of patterns) {
    result = result.replace(pattern, "").trim();
  }

  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// API helpers
// ─────────────────────────────────────────────────────────────────────────────

class ApiError extends Error {
  status: number;
  body: string;

  constructor(status: number, body: string) {
    super(`${status}: ${body.slice(0, 300)}`);
    this.status = status;
    this.body = body;
  }
}

async function apiRequest<T>(
  method: "GET" | "POST" | "PUT" | "DELETE",
  path: string,
  body?: unknown,
): Promise<T> {
  const r = await fetch(`${JANT_BASE_URL}${path}`, {
    method,
    headers: body === undefined ? AUTH : JSON_HDRS,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!r.ok) {
    const txt = await r.text().catch(() => "");
    throw new ApiError(r.status, txt);
  }
  return r.json();
}

async function apiPost<T>(path: string, body: unknown): Promise<T> {
  return apiRequest("POST", path, body);
}

async function apiGet<T>(path: string): Promise<T> {
  return apiRequest("GET", path);
}

async function apiPut<T>(path: string, body: unknown): Promise<T> {
  return apiRequest("PUT", path, body);
}

async function apiDelete<T>(path: string): Promise<T> {
  return apiRequest("DELETE", path);
}

async function apiWithPathFallback<T>(
  method: "POST" | "PUT" | "DELETE",
  paths: string[],
  body?: unknown,
): Promise<T> {
  let lastError: unknown;

  for (const path of paths) {
    try {
      return await apiRequest<T>(method, path, body);
    } catch (error) {
      lastError = error;
      if (error instanceof ApiError && error.status === 404) {
        continue;
      }
      throw error;
    }
  }

  throw lastError ?? new Error("No directory-item endpoint available");
}

async function apiCreateDirectoryItem<T>(body: unknown): Promise<T> {
  return apiWithPathFallback(
    "POST",
    ["/api/collections/directory-items", "/api/collections/sidebar-items"],
    body,
  );
}

async function apiUpdateDirectoryItem<T>(
  id: string,
  body: unknown,
): Promise<T> {
  return apiWithPathFallback(
    "PUT",
    [
      `/api/collections/directory-items/${id}`,
      `/api/collections/sidebar-items/${id}`,
    ],
    body,
  );
}

async function apiDeleteDirectoryItem<T>(id: string): Promise<T> {
  return apiWithPathFallback(
    "DELETE",
    [
      `/api/collections/directory-items/${id}`,
      `/api/collections/sidebar-items/${id}`,
    ],
  );
}

async function apiMoveDirectoryItem<T>(id: string, body: unknown): Promise<T> {
  return apiWithPathFallback(
    "PUT",
    [
      `/api/collections/directory-items/${id}/move`,
      `/api/collections/sidebar-items/${id}/move`,
    ],
    body,
  );
}

function findCollectionSpec(
  slug: string,
):
  | { section: SidebarSectionSpec; item: CollectionSidebarItemSpec }
  | undefined {
  for (const section of SIDEBAR_LAYOUT) {
    for (const item of section.items) {
      if (item.type === "collection" && item.slug === slug) {
        return { section, item };
      }
    }
  }
  return undefined;
}

function getSidebarItems(index: CollectionsIndexResponse): JantSidebarItem[] {
  return index.sidebarItems ?? index.directoryItems ?? [];
}

export async function bootstrapCollections(): Promise<Map<string, string>> {
  const collectionIds = new Map<string, string>();
  const collectionItems = SIDEBAR_LAYOUT.flatMap((section) =>
    section.items.filter(
      (item): item is CollectionSidebarItemSpec => item.type === "collection",
    )
  );
  const linkItems = SIDEBAR_LAYOUT.flatMap((section) =>
    section.items.filter(
      (item): item is LinkSidebarItemSpec => item.type === "link",
    )
  );
  const totalCollections = collectionItems.length;

  console.log("🗂️   Bootstrapping collections and sidebar");
  console.log(
    `    Dividers: ${SIDEBAR_LAYOUT.length}, Collections: ${totalCollections}, Links: ${linkItems.length}`,
  );

  if (flagDryRun) {
    for (const section of SIDEBAR_LAYOUT) {
      console.log(`    [dry-run] Divider: ${section.label}`);
      for (const item of section.items) {
        if (item.type === "collection") {
          collectionIds.set(item.slug, `<dry-run:${item.slug}>`);
          console.log(
            `      [dry-run] Collection: ${item.title} (${item.slug})`,
          );
        } else {
          console.log(`      [dry-run] Link: ${item.label} -> ${item.url}`);
        }
      }
    }
    return collectionIds;
  }

  let index = await apiGet<CollectionsIndexResponse>("/api/collections");
  let sidebarItems = getSidebarItems(index);
  const collectionsBySlug = new Map(
    index.collections.map((collection) => [collection.slug, collection]),
  );

  for (const collection of collectionItems) {
    const desiredSortOrder = collection.sortOrder ?? "newest";
    const existing = collectionsBySlug.get(collection.slug);
    if (existing) {
      if (
        existing.title !== collection.title ||
        existing.sortOrder !== desiredSortOrder
      ) {
        const updated = await apiPut<JantCollection>(
          `/api/collections/${existing.id}`,
          { title: collection.title, sortOrder: desiredSortOrder },
        );
        collectionsBySlug.set(updated.slug, updated);
        collectionIds.set(collection.slug, updated.id);
        console.log(
          `    ~ Collection updated: ${updated.slug} (${updated.id})`,
        );
      } else {
        collectionIds.set(collection.slug, existing.id);
        console.log(
          `    ↳ Collection exists: ${collection.slug} (${existing.id})`,
        );
      }
      continue;
    }

    const legacyExisting = (collection.legacySlugs ?? [])
      .map((slug) => collectionsBySlug.get(slug))
      .find((value): value is JantCollection => Boolean(value));
    if (legacyExisting) {
      const updated = await apiPut<JantCollection>(
        `/api/collections/${legacyExisting.id}`,
        {
          slug: collection.slug,
          title: collection.title,
          sortOrder: desiredSortOrder,
        },
      );
      for (const legacySlug of collection.legacySlugs ?? []) {
        collectionsBySlug.delete(legacySlug);
      }
      collectionsBySlug.set(updated.slug, updated);
      collectionIds.set(collection.slug, updated.id);
      console.log(
        `    ~ Collection renamed: ${legacyExisting.slug} -> ${updated.slug} (${updated.id})`,
      );
      continue;
    }

    const created = await apiPost<JantCollection>("/api/collections", {
      slug: collection.slug,
      title: collection.title,
      sortOrder: desiredSortOrder,
    });
    collectionsBySlug.set(created.slug, created);
    collectionIds.set(collection.slug, created.id);
    console.log(`    + Collection created: ${created.slug} (${created.id})`);
  }

  for (const obsoleteSlug of OBSOLETE_COLLECTION_SIDEBAR_SLUGS) {
    const obsoleteCollection = collectionsBySlug.get(obsoleteSlug);
    if (!obsoleteCollection) continue;

    const obsoleteSidebarItem = sidebarItems.find(
      (item) =>
        item.type === "collection" &&
        item.collectionId === obsoleteCollection.id,
    );
    if (!obsoleteSidebarItem) continue;

    await apiDeleteDirectoryItem<{ success: boolean }>(obsoleteSidebarItem.id);
    console.log(
      `    - Removed obsolete sidebar collection: ${obsoleteSlug} (${obsoleteSidebarItem.id})`,
    );
  }

  for (const obsoleteLabel of OBSOLETE_DIVIDER_LABELS) {
    const obsoleteDivider = sidebarItems.find(
      (item) => item.type === "divider" && item.label === obsoleteLabel,
    );
    if (!obsoleteDivider) continue;

    await apiDeleteDirectoryItem<{ success: boolean }>(obsoleteDivider.id);
    console.log(
      `    - Removed obsolete divider: ${obsoleteLabel} (${obsoleteDivider.id})`,
    );
  }

  index = await apiGet<CollectionsIndexResponse>("/api/collections");
  sidebarItems = getSidebarItems(index);
  const dividersByLabel = new Map(
    sidebarItems
      .filter((item) => item.type === "divider")
      .map((item) => [item.label ?? "", item]),
  );

  for (const section of SIDEBAR_LAYOUT) {
    const existing = dividersByLabel.get(section.label);
    if (existing) {
      console.log(`    ↳ Divider exists: ${section.label} (${existing.id})`);
      continue;
    }

    const created = await apiCreateDirectoryItem<JantSidebarItem>(
      { type: "divider", label: section.label },
    );
    dividersByLabel.set(section.label, created);
    console.log(`    + Divider created: ${section.label} (${created.id})`);
  }

  index = await apiGet<CollectionsIndexResponse>("/api/collections");
  sidebarItems = getSidebarItems(index);
  const linkItemsByLabel = new Map(
    sidebarItems
      .filter((item) => item.type === "link")
      .map((item) => [item.label ?? "", item]),
  );

  for (const link of linkItems) {
    const existing = linkItemsByLabel.get(link.label);
    if (!existing) {
      const created = await apiCreateDirectoryItem<JantSidebarItem>(
        { type: "link", label: link.label, url: link.url },
      );
      linkItemsByLabel.set(link.label, created);
      console.log(`    + Link created: ${link.label} -> ${link.url}`);
      continue;
    }

    if (existing.url !== link.url) {
      const updated = await apiUpdateDirectoryItem<JantSidebarItem>(
        existing.id,
        { label: link.label, url: link.url },
      );
      linkItemsByLabel.set(link.label, updated);
      console.log(`    ~ Link updated: ${link.label} -> ${link.url}`);
    } else {
      console.log(`    ↳ Link exists: ${link.label} (${existing.id})`);
    }
  }

  index = await apiGet<CollectionsIndexResponse>("/api/collections");
  sidebarItems = getSidebarItems(index);

  const desiredSidebarOrder: string[] = [];
  for (const section of SIDEBAR_LAYOUT) {
    const dividerItem = sidebarItems.find(
      (item) => item.type === "divider" && item.label === section.label,
    );
    if (!dividerItem) {
      throw new Error(
        `Missing sidebar divider after creation: ${section.label}`,
      );
    }
    desiredSidebarOrder.push(dividerItem.id);

    for (const item of section.items) {
      if (item.type === "collection") {
        const collectionId = collectionIds.get(item.slug);
        if (!collectionId) {
          throw new Error(`Missing collection id for slug: ${item.slug}`);
        }
        const sidebarItem = sidebarItems.find(
          (sidebar) =>
            sidebar.type === "collection" &&
            sidebar.collectionId === collectionId,
        );
        if (!sidebarItem) {
          throw new Error(
            `Missing sidebar collection item for slug: ${item.slug}`,
          );
        }
        desiredSidebarOrder.push(sidebarItem.id);
        continue;
      }

      const sidebarItem = sidebarItems.find(
        (sidebar) =>
          sidebar.type === "link" &&
          sidebar.label === item.label &&
          sidebar.url === item.url,
      );
      if (!sidebarItem) {
        throw new Error(`Missing sidebar link item for label: ${item.label}`);
      }
      desiredSidebarOrder.push(sidebarItem.id);
    }
  }

  let after: string | null = null;
  for (const itemId of desiredSidebarOrder) {
    await apiMoveDirectoryItem<{ success?: boolean }>(
      itemId,
      { after },
    );
    after = itemId;
  }

  console.log("    ✓ Sidebar order synced");

  return collectionIds;
}

// ─────────────────────────────────────────────────────────────────────────────
// Migrate one post
// ─────────────────────────────────────────────────────────────────────────────

async function migrateOne(
  filePath: string,
  state: State,
  counters: Record<PostFormat, number>,
  quoteThreads: Map<string, ThreadState>,
  collectionIdsBySlug: Map<string, string>,
): Promise<"success" | "error" | "skipped" | "stop"> {
  const rel = relative(BLOG_DIR, filePath);

  // Already successfully migrated
  if (state.migrated[rel]?.status === "success") return "skipped";

  const raw = await Deno.readTextFile(filePath);
  const { meta, body } = parseFrontmatter(raw);
  const { format, subtype } = classify(rel);

  if (ONLY_TYPE && format !== ONLY_TYPE) return "skipped";
  if (counters[format] >= LIMIT) return "stop";

  console.log(
    `\n📄  ${rel}  [${format}${subtype !== format ? "/" + subtype : ""}]`,
  );

  // ── Extract meta fields ─────────────────────────────────────────────────
  const rawTitle = String(meta.title ?? "").trim();
  const title = rawTitle && rawTitle !== "Untitled" ? rawTitle : undefined;

  const dateStr = String(meta.date ?? "");
  const publishedAt = dateStr
    ? Math.floor(new Date(dateStr).getTime() / 1000)
    : undefined;
  if (dateStr && isNaN(publishedAt!)) {
    console.warn(`  ⚠️   Could not parse date: ${dateStr}`);
  }

  const isDraft = meta.draft === true;

  const extraMeta = (meta.extra ?? {}) as Record<string, unknown>;
  const rawSourceName = normalizeOptionalString(
    extraMeta.source_name ?? extraMeta.sourceName,
  );
  const sourceName = normalizeQuoteSourceName(rawSourceName);
  const rating = extraMeta.rating != null
    ? Number(extraMeta.rating)
    : undefined;
  const rawUrl = normalizeOptionalString(
    extraMeta.source_url ?? extraMeta.sourceUrl ?? extraMeta.url,
  );
  const sourceUrl = normalizeOptionalUrl(rawUrl);
  const quoteThreadKey = normalizeOptionalString(
    extraMeta.jant_thread_key ?? extraMeta.thread_key,
  );
  const quoteThreadOrder = normalizeOptionalInteger(
    extraMeta.jant_thread_order ?? extraMeta.thread_order,
  );
  if (rawUrl && !sourceUrl) {
    console.warn(`  ⚠️   Invalid URL in frontmatter, skipping: ${rawUrl}`);
  }
  if (format === "quote" && rawSourceName && !sourceName) {
    console.warn(
      `  ⚠️   Suspicious source_name in frontmatter, omitting: ${rawSourceName}`,
    );
  }

  const existingThread = quoteThreadKey
    ? quoteThreads.get(quoteThreadKey)
    : undefined;
  if (
    format === "quote" && quoteThreadKey && (quoteThreadOrder ?? 1) > 1 &&
    !existingThread
  ) {
    const msg =
      `thread reply encountered before root: key=${quoteThreadKey} order=${quoteThreadOrder}`;
    console.error(`  ❌  ${msg}`);
    state.migrated[rel] = {
      sourcePath: filePath,
      jantId: "",
      jantSlug: "",
      format,
      migratedAt: new Date().toISOString(),
      status: "error",
      error: msg,
    };
    return "error";
  }

  // ── Process markdown body (images + link conversion) ────────────────────
  // Quotes use plain text for quoteText — no markdown processing needed
  let processedMarkdown = "";
  if (format !== "quote" && body) {
    processedMarkdown = await processMarkdown(body, filePath);
  }

  // ── Build API payload ────────────────────────────────────────────────────
  const payload: Record<string, unknown> = {
    format,
    status: isDraft ? "draft" : "published",
  };
  const collectionIds = resolveCollectionSlugs(rel)
    .map((slug) => {
      const id = collectionIdsBySlug.get(slug);
      if (!id) {
        const spec = findCollectionSpec(slug);
        const label = spec
          ? `${spec.section.label} / ${spec.item.title}`
          : slug;
        console.warn(`  ⚠️   Collection not bootstrapped for ${label}`);
      }
      return id;
    })
    .filter((id): id is string => Boolean(id));

  if (publishedAt && !isNaN(publishedAt) && !isDraft) {
    payload.publishedAt = publishedAt;
  }
  if (rating != null && rating >= 1 && rating <= 5) {
    payload.rating = Math.round(rating);
  }
  if (collectionIds.length > 0) {
    payload.collectionIds = collectionIds;
  }

  if (format === "quote") {
    // quoteText = raw body text; sourceName/sourceUrl are optional attribution.
    payload.quoteText = stripTrailingQuoteAttribution(body, sourceName) ||
      body.trim();
    if (sourceName) payload.sourceName = sourceName;
    if (sourceUrl) payload.sourceUrl = sourceUrl;
    if (existingThread) payload.replyToId = existingThread.rootId;
    // No explicit path for quotes.
  } else if (format === "link") {
    if (sourceUrl) payload.url = sourceUrl;
    if (title) payload.title = title;
    if (processedMarkdown) payload.bodyMarkdown = processedMarkdown;
    payload.path = toCustomPath(rel);
  } else {
    // note (including thoughts)
    if (title) payload.title = title;
    if (processedMarkdown) payload.bodyMarkdown = processedMarkdown;
    // Only non-thought notes get an explicit path (Jant auto-generates slug + alias).
    if (subtype !== "thought") payload.path = toCustomPath(rel);
  }

  // ── Dry run ──────────────────────────────────────────────────────────────
  if (flagDryRun) {
    const preview = { ...payload };
    if (preview.bodyMarkdown) preview.bodyMarkdown = "<markdown>";
    console.log("  [dry-run] Payload:", JSON.stringify(preview, null, 4));
    if (format === "quote" && quoteThreadKey && !existingThread) {
      quoteThreads.set(quoteThreadKey, {
        rootId: `<dry-run:${quoteThreadKey}>`,
        rootPath: rel,
      });
    }
    counters[format]++;
    return "success";
  }

  // ── Create post ──────────────────────────────────────────────────────────
  let created: { id: string; slug?: string | null };
  try {
    created = await apiPost<{ id: string; slug?: string | null }>(
      "/api/posts",
      payload,
    );
    console.log(
      `  ✅  Created:${
        created.slug ? ` slug=${created.slug}` : ""
      } id=${created.id}`,
    );
  } catch (err) {
    const msg = (err as Error).message;
    console.error(`  ❌  Post creation failed: ${msg}`);
    state.migrated[rel] = {
      sourcePath: filePath,
      jantId: "",
      jantSlug: "",
      format,
      migratedAt: new Date().toISOString(),
      status: "error",
      error: msg,
    };
    return "error";
  }

  // ── Save state ───────────────────────────────────────────────────────────
  state.migrated[rel] = {
    sourcePath: filePath,
    jantId: created.id,
    jantSlug: created.slug ?? "",
    format,
    migratedAt: new Date().toISOString(),
    status: "success",
  };

  if (format === "quote" && quoteThreadKey && !existingThread) {
    quoteThreads.set(quoteThreadKey, {
      rootId: created.id,
      rootPath: rel,
    });
    console.log(`  🧵  Thread root: ${quoteThreadKey}`);
  } else if (format === "quote" && existingThread) {
    console.log(`  🧵  Reply to: ${existingThread.rootPath}`);
  }

  counters[format]++;
  return "success";
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🚀  Jant Migration");
  console.log(`    URL    : ${JANT_BASE_URL}`);
  console.log(`    Limit  : ${LIMIT === Infinity ? "all" : LIMIT} per type`);
  if (ONLY_TYPE) console.log(`    Type   : ${ONLY_TYPE} only`);
  if (flagDryRun) console.log("    Mode   : DRY RUN (no writes)");
  console.log();

  const state = await loadState();
  const collectionIdsBySlug = await bootstrapCollections();
  const files = await scanBlogFiles();
  console.log(`Found ${files.length} markdown files\n`);

  const counters: Record<PostFormat, number> = { note: 0, link: 0, quote: 0 };
  const stats = { success: 0, error: 0, skipped: 0 };
  const errorLog: { path: string; error: string }[] = [];
  const quoteThreads = new Map<string, ThreadState>();

  for (const file of files) {
    // Stop if all relevant type limits are reached
    const done = ONLY_TYPE
      ? counters[ONLY_TYPE] >= LIMIT
      : counters.note >= LIMIT &&
        counters.link >= LIMIT &&
        counters.quote >= LIMIT;
    if (done) break;

    const res = await migrateOne(
      file,
      state,
      counters,
      quoteThreads,
      collectionIdsBySlug,
    );

    if (res === "success") stats.success++;
    else if (res === "error") {
      stats.error++;
      const entry = state.migrated[relative(BLOG_DIR, file)];
      if (entry?.error) {
        errorLog.push({ path: relative(BLOG_DIR, file), error: entry.error });
      }
    } else if (res === "skipped") stats.skipped++;
    // "stop" means this type is full; continue loop for other types

    if (!flagDryRun && res !== "skipped") await saveState(state);
  }

  console.log("\n──────────────────────────────────────────");
  console.log("Migration complete!");
  console.log(`  ✅  Created : ${stats.success}`);
  console.log(`  ❌  Errors  : ${stats.error}`);
  console.log(`  ⏭️   Skipped : ${stats.skipped}`);
  console.log(
    `  Breakdown  : note=${counters.note}, link=${counters.link}, quote=${counters.quote}`,
  );
  if (errorLog.length > 0) {
    console.log("\n❌  Error details:");
    for (const { path, error } of errorLog) {
      console.log(`  • ${path}`);
      console.log(`    ${error}`);
    }
  }
}

if (import.meta.main) {
  main().catch((e) => {
    console.error("Fatal:", e);
    Deno.exit(1);
  });
}
