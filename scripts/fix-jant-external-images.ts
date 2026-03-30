#!/usr/bin/env -S deno run --allow-read --allow-net --allow-env --unsafely-ignore-certificate-errors

/**
 * Find non-CDN images in Jant "note" posts, download and re-upload them
 * to Jant media, then update the post body with the new URLs.
 *
 * "CDN" means hosted on JANT_BASE_URL or media.jant.me (configurable via
 * JANT_CDN_HOSTS env var, comma-separated).
 *
 * Usage:
 *   deno run --allow-all --unsafely-ignore-certificate-errors scripts/fix-jant-external-images.ts
 *   deno run --allow-all --unsafely-ignore-certificate-errors scripts/fix-jant-external-images.ts --dry-run
 *   deno run --allow-all --unsafely-ignore-certificate-errors scripts/fix-jant-external-images.ts --format=note|link|quote|all
 *   deno run --allow-all --unsafely-ignore-certificate-errors scripts/fix-jant-external-images.ts --status=published|draft|all
 *   deno run --allow-all --unsafely-ignore-certificate-errors scripts/fix-jant-external-images.ts --limit=10
 */

import "jsr:@std/dotenv/load";

const JANT_BASE_URL = Deno.env.get("JANT_BASE_URL") ??
  "https://jant.localtest.me";
const JANT_DEV_API_TOKEN = Deno.env.get("JANT_DEV_API_TOKEN");

if (!JANT_DEV_API_TOKEN) {
  console.error("❌  JANT_DEV_API_TOKEN not set in .env");
  Deno.exit(1);
}

const args = Deno.args;
const flagDryRun = args.includes("--dry-run");
const statusArg = args.find((arg) => arg.startsWith("--status="));
const formatArg = args.find((arg) => arg.startsWith("--format="));
const limitArg = args.find((arg) => arg.startsWith("--limit="));

const STATUS_FILTER = statusArg?.split("=")[1] ?? "all";
const FORMAT_FILTER = formatArg?.split("=")[1] ?? "note";
const MATCH_LIMIT = limitArg ? parseInt(limitArg.split("=")[1], 10) : Infinity;

if (!["all", "published", "draft"].includes(STATUS_FILTER)) {
  console.error("❌  --status must be one of: published, draft, all");
  Deno.exit(1);
}

if (!["all", "note", "link", "quote"].includes(FORMAT_FILTER)) {
  console.error("❌  --format must be one of: note, link, quote, all");
  Deno.exit(1);
}

const AUTH = {
  Authorization: `Bearer ${JANT_DEV_API_TOKEN}`,
} as Record<string, string>;
const JSON_HDRS = { ...AUTH, "Content-Type": "application/json" };

// ─────────────────────────────────────────────────────────────────────────────
// CDN host detection
// ─────────────────────────────────────────────────────────────────────────────

function buildCdnHosts(): Set<string> {
  const hosts = new Set<string>();

  // Always include Jant base URL host
  try {
    hosts.add(new URL(JANT_BASE_URL).hostname);
  } catch { /* ignore */ }

  // Default CDN host
  hosts.add("media.jant.me");

  // Extra hosts from env
  const extra = Deno.env.get("JANT_CDN_HOSTS");
  if (extra) {
    for (const h of extra.split(",")) {
      const trimmed = h.trim();
      if (trimmed) hosts.add(trimmed);
    }
  }

  return hosts;
}

const CDN_HOSTS = buildCdnHosts();

function isCdnUrl(url: string): boolean {
  try {
    const hostname = new URL(url).hostname;
    if (CDN_HOSTS.has(hostname)) return true;
    // Treat all *.jant.me subdomains as CDN
    if (hostname === "jant.me" || hostname.endsWith(".jant.me")) return true;
    return false;
  } catch {
    return false;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type PostFormat = "note" | "link" | "quote";
type PostStatus = "published" | "draft";

interface JantPostListItem {
  id: string;
  format: PostFormat;
  status: PostStatus;
  slug: string;
  body: string | null;
  bodyHtml: string | null;
  url?: string | null;
  sourceUrl?: string | null;
  updatedAt: number;
}

interface PostsListResponse {
  posts: JantPostListItem[];
  nextCursor: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// API helpers
// ─────────────────────────────────────────────────────────────────────────────

async function* listPosts(
  status: PostStatus,
): AsyncGenerator<JantPostListItem> {
  let cursor: string | null = null;

  while (true) {
    const url = new URL("/api/posts", JANT_BASE_URL);
    url.searchParams.set("limit", "100");
    url.searchParams.set("status", status);
    if (cursor) url.searchParams.set("cursor", cursor);

    const response = await fetch(url, { headers: AUTH });
    if (!response.ok) {
      throw new Error(`${response.status}: ${await response.text()}`);
    }

    const json = (await response.json()) as PostsListResponse;

    for (const post of json.posts) {
      yield post;
    }

    if (!json.nextCursor) break;
    cursor = json.nextCursor;
  }
}

async function apiPut<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${JANT_BASE_URL}${path}`, {
    method: "PUT",
    headers: JSON_HDRS,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`${response.status}: ${await response.text()}`);
  }

  return response.json();
}

// ─────────────────────────────────────────────────────────────────────────────
// Download & upload
// ─────────────────────────────────────────────────────────────────────────────

async function downloadFile(
  url: string,
): Promise<{ data: Uint8Array } | null> {
  try {
    const r = await fetch(url);
    if (!r.ok) {
      console.warn(`      ⚠️  Download failed: ${r.status} ${url}`);
      return null;
    }
    return { data: new Uint8Array(await r.arrayBuffer()) };
  } catch (e) {
    console.warn(
      `      ⚠️  Download error ${url}: ${(e as Error).message}`,
    );
    return null;
  }
}

async function uploadBlob(
  data: Uint8Array,
  filename: string,
): Promise<{ id: string; url: string } | null> {
  try {
    const fd = new FormData();
    fd.append("file", new Blob([data]), filename);
    const r = await fetch(`${JANT_BASE_URL}/api/upload`, {
      method: "POST",
      headers: AUTH,
      body: fd,
    });
    if (!r.ok) {
      const txt = await r.text().catch(() => "");
      console.warn(
        `      ⚠️  Upload ${filename} failed: ${r.status} ${txt.slice(0, 100)}`,
      );
      return null;
    }
    return r.json();
  } catch (e) {
    console.warn(
      `      ⚠️  Upload error ${filename}: ${(e as Error).message}`,
    );
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Broken URL repair (e.g. https://jant.localtest.mehttps://media-dev.jant.me/...)
// ─────────────────────────────────────────────────────────────────────────────

const BROKEN_URL_RE = /^https?:\/\/[^/]+https?:\/\//;

/**
 * If a URL looks like a broken double-prefix from an earlier migration,
 * extract the real URL (the second https://...) and check if it's already
 * on CDN. Returns the fixed URL or null if not a broken URL.
 */
function tryFixBrokenUrl(src: string): string | null {
  const m = src.match(/^https?:\/\/[^/]+(https?:\/\/.+)$/);
  if (!m) return null;
  return m[1];
}

// ─────────────────────────────────────────────────────────────────────────────
// Image replacement logic (ProseMirror JSON body)
// ─────────────────────────────────────────────────────────────────────────────

// deno-lint-ignore no-explicit-any
type DocNode = Record<string, any>;

/**
 * Walk the ProseMirror doc tree and collect all external image `src` values.
 * Broken double-prefix URLs are NOT included here — they are handled separately.
 */
function findExternalImages(bodyJson: string): string[] {
  let doc: DocNode;
  try {
    doc = JSON.parse(bodyJson);
  } catch {
    return [];
  }

  const urls: string[] = [];
  const seen = new Set<string>();

  function walk(node: DocNode) {
    if (node.type === "image" && node.attrs?.src) {
      const src: string = node.attrs.src;
      if (seen.has(src)) return;
      seen.add(src);

      // Skip broken URLs (handled by fixBrokenUrls)
      if (BROKEN_URL_RE.test(src)) return;

      if (/^https?:\/\//.test(src) && !isCdnUrl(src)) {
        urls.push(src);
      }
    }
    if (Array.isArray(node.content)) {
      for (const child of node.content) walk(child);
    }
  }

  walk(doc);
  return urls;
}

/**
 * Walk the doc tree and find broken double-prefix URLs.
 * Returns count of fixable URLs.
 */
function findBrokenUrls(bodyJson: string): string[] {
  let doc: DocNode;
  try {
    doc = JSON.parse(bodyJson);
  } catch {
    return [];
  }

  const urls: string[] = [];
  const seen = new Set<string>();

  function walk(node: DocNode) {
    if (node.type === "image" && node.attrs?.src) {
      const src: string = node.attrs.src;
      if (!seen.has(src) && BROKEN_URL_RE.test(src)) {
        seen.add(src);
        urls.push(src);
      }
    }
    if (Array.isArray(node.content)) {
      for (const child of node.content) walk(child);
    }
  }

  walk(doc);
  return urls;
}

/**
 * Fix broken double-prefix URLs in the doc tree in-place.
 */
function fixBrokenUrls(doc: DocNode): number {
  let fixed = 0;

  function walk(node: DocNode) {
    if (node.type === "image" && node.attrs?.src) {
      const repaired = tryFixBrokenUrl(node.attrs.src);
      if (repaired) {
        node.attrs.src = repaired;
        fixed++;
      }
    }
    if (Array.isArray(node.content)) {
      for (const child of node.content) walk(child);
    }
  }

  walk(doc);
  return fixed;
}

function filenameFromUrl(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const base = pathname.split("/").pop();
    return base && base !== "" ? decodeURIComponent(base) : "image";
  } catch {
    return "image";
  }
}

/**
 * Process a post body:
 * 1. Fix broken double-prefix URLs (just string repair, no download)
 * 2. Download & re-upload truly external images
 * Returns a new JSON string and counts.
 */
async function processBody(
  bodyJson: string,
  dryRun: boolean,
): Promise<{ newBody: string; fixedBroken: number; replacedExternal: number }> {
  let doc: DocNode;
  try {
    doc = JSON.parse(bodyJson);
  } catch {
    return { newBody: bodyJson, fixedBroken: 0, replacedExternal: 0 };
  }

  // ── Step 1: Fix broken URLs ──────────────────────────────────────────────
  const fixedBroken = dryRun ? findBrokenUrls(bodyJson).length : fixBrokenUrls(doc);

  // ── Step 2: Download & upload external images ────────────────────────────
  // After fixing broken URLs, re-serialize to find remaining external images
  const intermediate = JSON.stringify(doc);
  const externalUrls = findExternalImages(intermediate);
  const urlMap = new Map<string, string>();

  for (const src of externalUrls) {
    const filename = filenameFromUrl(src);

    if (dryRun) {
      console.log(`      [dry-run] Would download & upload: ${src}`);
      urlMap.set(src, "<dry-run>");
      continue;
    }

    const downloaded = await downloadFile(src);
    if (!downloaded) continue;

    const uploaded = await uploadBlob(downloaded.data, filename);
    if (!uploaded) continue;

    const jantUrl = new URL(uploaded.url, JANT_BASE_URL).toString();
    urlMap.set(src, jantUrl);
    console.log(`      📷  ${filename} → ${jantUrl}`);
  }

  if (dryRun) {
    return {
      newBody: bodyJson,
      fixedBroken,
      replacedExternal: urlMap.size,
    };
  }

  // Walk tree and replace external src in-place
  let replacedExternal = 0;
  function rewrite(node: DocNode) {
    if (node.type === "image" && node.attrs?.src) {
      const newUrl = urlMap.get(node.attrs.src);
      if (newUrl) {
        node.attrs.src = newUrl;
        replacedExternal++;
      }
    }
    if (Array.isArray(node.content)) {
      for (const child of node.content) rewrite(child);
    }
  }

  rewrite(doc);
  return { newBody: JSON.stringify(doc), fixedBroken, replacedExternal };
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  const statuses: PostStatus[] =
    STATUS_FILTER === "all"
      ? ["published", "draft"]
      : [STATUS_FILTER as PostStatus];

  console.log("🖼️   Fix External Images in Jant Posts");
  console.log(`    URL    : ${JANT_BASE_URL}`);
  console.log(`    CDN    : ${[...CDN_HOSTS].join(", ")}`);
  console.log(`    Format : ${FORMAT_FILTER}`);
  console.log(`    Status : ${statuses.join(", ")}`);
  console.log(
    `    Limit  : ${Number.isFinite(MATCH_LIMIT) ? MATCH_LIMIT : "all matches"}`,
  );
  if (flagDryRun) console.log("    Mode   : DRY RUN (no writes)");
  console.log();

  let scanned = 0;
  let matched = 0;
  let updated = 0;
  let totalBrokenFixed = 0;
  let totalExternalReplaced = 0;

  for (const status of statuses) {
    for await (const post of listPosts(status)) {
      if (FORMAT_FILTER !== "all" && post.format !== FORMAT_FILTER) continue;

      scanned++;

      if (!post.body) continue;

      const brokenUrls = findBrokenUrls(post.body);
      const externalUrls = findExternalImages(post.body);
      if (brokenUrls.length === 0 && externalUrls.length === 0) continue;

      matched++;
      console.log(
        `  📄  ${post.slug || post.id} (${post.format})`,
      );
      for (const url of brokenUrls) {
        const fixed = tryFixBrokenUrl(url);
        console.log(`      🔧 broken: ${url}`);
        if (fixed) console.log(`         → ${fixed}`);
      }
      for (const url of externalUrls) {
        console.log(`      ↳ ${url}`);
      }

      const { newBody, fixedBroken, replacedExternal } = await processBody(
        post.body,
        flagDryRun,
      );
      totalBrokenFixed += fixedBroken;
      totalExternalReplaced += replacedExternal;

      const totalChanges = fixedBroken + replacedExternal;
      if (!flagDryRun && totalChanges > 0 && newBody !== post.body) {
        await apiPut(`/api/posts/${post.id}`, { body: newBody });
        updated++;
        console.log(
          `    ✓ Updated (${fixedBroken} broken fixed, ${replacedExternal} external uploaded)`,
        );
      }

      if (matched >= MATCH_LIMIT) {
        console.log("\n    Reached match limit, stopping early.\n");
        break;
      }
    }

    if (matched >= MATCH_LIMIT) break;
  }

  console.log("──────────────────────────────────────────");
  console.log(
    `Summary: scanned=${scanned}, matched=${matched}, updated=${updated}, brokenFixed=${totalBrokenFixed}, externalUploaded=${totalExternalReplaced}`,
  );
}

if (import.meta.main) {
  main().catch((error) => {
    console.error("Fatal:", error);
    Deno.exit(1);
  });
}
