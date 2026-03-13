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
 *   content/blog/quotes/   → Jant format=quote  (no slug, no custom URL)
 *   content/blog/links/    → Jant format=link   (slug + custom URL)
 *   content/blog/thoughts/ → Jant format=note   (no slug, no custom URL)
 *   everything else        → Jant format=note   (slug + custom URL)
 *
 * State is saved to temp-state.json after each post.
 * Re-running will skip already-migrated posts.
 */

import "jsr:@std/dotenv/load";
import { parse as parseYaml } from "jsr:@std/yaml";
import { walk } from "jsr:@std/fs/walk";
import { basename, dirname, join, relative } from "jsr:@std/path";

// ─────────────────────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────────────────────

const JANT_BASE_URL = Deno.env.get("JANT_BASE_URL") ?? "https://jant.localtest.me";
const JANT_API_TOKEN = Deno.env.get("JANT_API_TOKEN");
if (!JANT_API_TOKEN) {
  console.error("❌  JANT_API_TOKEN not set in .env");
  Deno.exit(1);
}

const BLOG_DIR = "content/blog";
const STATE_FILE = "temp-state.json";
const DEFAULT_LIMIT = 2;

const args = Deno.args;
const flagAll = args.includes("--all");
const flagDryRun = args.includes("--dry-run");
const limitArg = args.find((a) => a.startsWith("--limit="));
const typeArg = args.find((a) => a.startsWith("--type="));

const LIMIT = flagAll ? Infinity : (limitArg ? parseInt(limitArg.split("=")[1], 10) : DEFAULT_LIMIT);
const ONLY_TYPE = typeArg?.split("=")[1] as PostFormat | undefined;

const AUTH = { Authorization: `Bearer ${JANT_API_TOKEN}` } as Record<string, string>;
const JSON_HDRS = { ...AUTH, "Content-Type": "application/json" };

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type PostFormat = "note" | "link" | "quote";
type PostSubtype = "note" | "thought" | "link" | "quote";

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
  migrated: Record<string, MigratedEntry>; // key = relPath
  lastRun: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// State management
// ─────────────────────────────────────────────────────────────────────────────

async function loadState(): Promise<State> {
  try {
    return JSON.parse(await Deno.readTextFile(STATE_FILE));
  } catch {
    return { migrated: {}, lastRun: "" };
  }
}

async function saveState(state: State): Promise<void> {
  state.lastRun = new Date().toISOString();
  await Deno.writeTextFile(STATE_FILE, JSON.stringify(state, null, 2));
}

// ─────────────────────────────────────────────────────────────────────────────
// File scanning
// ─────────────────────────────────────────────────────────────────────────────

async function scanBlogFiles(): Promise<string[]> {
  const files: string[] = [];
  for await (const entry of walk(BLOG_DIR, { exts: ["md"], includeDirs: false })) {
    if (/\/_?index(\.en)?\.md$/.test(entry.path)) continue;
    files.push(entry.path);
  }
  return files.sort();
}

// ─────────────────────────────────────────────────────────────────────────────
// Frontmatter parsing
// ─────────────────────────────────────────────────────────────────────────────

function parseFrontmatter(content: string): { meta: Record<string, unknown>; body: string } {
  const m = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { meta: {}, body: content.trim() };
  let meta: Record<string, unknown> = {};
  try {
    meta = (parseYaml(m[1]) as Record<string, unknown>) ?? {};
  } catch { /* ignore */ }
  return { meta, body: m[2].trim() };
}

// ─────────────────────────────────────────────────────────────────────────────
// Classification & slug helpers
// ─────────────────────────────────────────────────────────────────────────────

function classify(relPath: string): { format: PostFormat; subtype: PostSubtype } {
  if (relPath.startsWith("quotes/")) return { format: "quote", subtype: "quote" };
  if (relPath.startsWith("links/")) return { format: "link", subtype: "link" };
  if (relPath.startsWith("thoughts/")) return { format: "note", subtype: "thought" };
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
): Promise<{ markdown: string; mediaIds: string[] }> {
  let result = md;
  const mediaIds: string[] = [];
  const seen = new Set<string>();

  // ── 1. Upload local images and replace URLs ─────────────────────────────
  for (const m of md.matchAll(/!\[([^\]]*)\]\(([^)]+)\)/g)) {
    const alt = m[1];
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
      mediaIds.push(uploaded.id);
      const jantUrl = JANT_BASE_URL + uploaded.url;
      // Replace all occurrences of this src in the markdown
      result = result.replaceAll(
        `![${alt}](${src})`,
        `![${alt}](${jantUrl})`,
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
        newHref = "/" + href.slice(2).replace(/\.md$/, "").replace(/\/index$/, "");
      } else {
        newHref = "/" + href.slice("/content/".length).replace(/\.md$/, "").replace(/\/index$/, "");
      }
      return `[${text}](${newHref})`;
    },
  );

  // ── 3. Normalize read-more separator ────────────────────────────────────
  // Zola uses <!-- more -->, Jant uses <!--more-->
  result = result.replace(/<!--\s*more\s*-->/g, "<!--more-->");

  return { markdown: result, mediaIds };
}

async function uploadFile(path: string): Promise<{ id: string; url: string } | null> {
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
      console.warn(`  ⚠️   Upload ${basename(path)} failed: ${r.status} ${txt.slice(0, 100)}`);
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

// ─────────────────────────────────────────────────────────────────────────────
// API helpers
// ─────────────────────────────────────────────────────────────────────────────

async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const r = await fetch(`${JANT_BASE_URL}${path}`, {
    method: "POST",
    headers: JSON_HDRS,
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    const txt = await r.text().catch(() => "");
    throw new Error(`${r.status}: ${txt.slice(0, 300)}`);
  }
  return r.json();
}

// ─────────────────────────────────────────────────────────────────────────────
// Migrate one post
// ─────────────────────────────────────────────────────────────────────────────

async function migrateOne(
  filePath: string,
  state: State,
  counters: Record<PostFormat, number>,
): Promise<"success" | "error" | "skipped" | "stop"> {
  const rel = relative(BLOG_DIR, filePath);

  // Already successfully migrated
  if (state.migrated[rel]?.status === "success") return "skipped";

  const raw = await Deno.readTextFile(filePath);
  const { meta, body } = parseFrontmatter(raw);
  const { format, subtype } = classify(rel);

  if (ONLY_TYPE && format !== ONLY_TYPE) return "skipped";
  if (counters[format] >= LIMIT) return "stop";

  console.log(`\n📄  ${rel}  [${format}${subtype !== format ? "/" + subtype : ""}]`);

  // ── Extract meta fields ─────────────────────────────────────────────────
  const rawTitle = String(meta.title ?? "").trim();
  const title = rawTitle && rawTitle !== "Untitled" ? rawTitle : undefined;

  const dateStr = String(meta.date ?? "");
  const publishedAt = dateStr ? Math.floor(new Date(dateStr).getTime() / 1000) : undefined;
  if (dateStr && isNaN(publishedAt!)) {
    console.warn(`  ⚠️   Could not parse date: ${dateStr}`);
  }

  const isDraft = meta.draft === true;

  const extraMeta = (meta.extra ?? {}) as Record<string, unknown>;
  const rating = extraMeta.rating != null ? Number(extraMeta.rating) : undefined;
  const rawUrl = extraMeta.url ? String(extraMeta.url) : undefined;
  const sourceUrl = isValidUrl(rawUrl) ? rawUrl : undefined;
  if (rawUrl && !sourceUrl) {
    console.warn(`  ⚠️   Invalid URL in frontmatter, skipping: ${rawUrl}`);
  }

  // ── Process markdown body (images + link conversion) ────────────────────
  // Quotes use plain text for quoteText — no markdown processing needed
  let processedMarkdown = "";
  let mediaIds: string[] = [];
  if (format !== "quote" && body) {
    const result = await processMarkdown(body, filePath);
    processedMarkdown = result.markdown;
    mediaIds = result.mediaIds;
  }

  // ── Build API payload ────────────────────────────────────────────────────
  const payload: Record<string, unknown> = {
    format,
    status: isDraft ? "draft" : "published",
  };

  if (publishedAt && !isNaN(publishedAt) && !isDraft) payload.publishedAt = publishedAt;
  if (mediaIds.length > 0) payload.mediaIds = mediaIds;
  if (rating != null && rating >= 1 && rating <= 5) payload.rating = Math.round(rating);

  if (format === "quote") {
    // quoteText = raw body text; url = optional source
    payload.quoteText = body.trim();
    if (sourceUrl) payload.url = sourceUrl;
    // No title, no explicit slug for quotes

  } else if (format === "link") {
    if (sourceUrl) payload.url = sourceUrl;
    if (title) payload.title = title;
    if (processedMarkdown) payload.bodyMarkdown = processedMarkdown;
    // No explicit slug for links — Jant auto-generates

  } else {
    // note (including thoughts)
    if (title) payload.title = title;
    if (processedMarkdown) payload.bodyMarkdown = processedMarkdown;
    // Only non-thought notes get an explicit path (Jant auto-generates slug + alias)
    if (subtype !== "thought") payload.path = toCustomPath(rel);
  }

  // ── Dry run ──────────────────────────────────────────────────────────────
  if (flagDryRun) {
    const preview = { ...payload };
    if (preview.bodyMarkdown) preview.bodyMarkdown = "<markdown>";
    console.log("  [dry-run] Payload:", JSON.stringify(preview, null, 4));
    counters[format]++;
    return "success";
  }

  // ── Create post ──────────────────────────────────────────────────────────
  let created: { id: string; slug: string };
  try {
    created = await apiPost<{ id: string; slug: string }>("/api/posts", payload);
    console.log(`  ✅  Created: slug=${created.slug} id=${created.id}`);
  } catch (err) {
    const msg = (err as Error).message;
    console.error(`  ❌  Post creation failed: ${msg}`);
    state.migrated[rel] = {
      sourcePath: filePath, jantId: "", jantSlug: "", format,
      migratedAt: new Date().toISOString(), status: "error", error: msg,
    };
    return "error";
  }

  // ── Save state ───────────────────────────────────────────────────────────
  state.migrated[rel] = {
    sourcePath: filePath,
    jantId: created.id,
    jantSlug: created.slug,
    format,
    migratedAt: new Date().toISOString(),
    status: "success",
  };

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
  const files = await scanBlogFiles();
  console.log(`Found ${files.length} markdown files\n`);

  const counters: Record<PostFormat, number> = { note: 0, link: 0, quote: 0 };
  const stats = { success: 0, error: 0, skipped: 0 };
  const errorLog: { path: string; error: string }[] = [];

  for (const file of files) {
    // Stop if all relevant type limits are reached
    const done = ONLY_TYPE
      ? counters[ONLY_TYPE] >= LIMIT
      : counters.note >= LIMIT && counters.link >= LIMIT && counters.quote >= LIMIT;
    if (done) break;

    const res = await migrateOne(file, state, counters);

    if (res === "success") stats.success++;
    else if (res === "error") {
      stats.error++;
      const entry = state.migrated[relative(BLOG_DIR, file)];
      if (entry?.error) errorLog.push({ path: relative(BLOG_DIR, file), error: entry.error });
    } else if (res === "skipped") stats.skipped++;
    // "stop" means this type is full; continue loop for other types

    if (!flagDryRun && res !== "skipped") await saveState(state);
  }

  console.log("\n──────────────────────────────────────────");
  console.log("Migration complete!");
  console.log(`  ✅  Created : ${stats.success}`);
  console.log(`  ❌  Errors  : ${stats.error}`);
  console.log(`  ⏭️   Skipped : ${stats.skipped}`);
  console.log(`  Breakdown  : note=${counters.note}, link=${counters.link}, quote=${counters.quote}`);
  if (!flagDryRun) console.log(`  State      : ${STATE_FILE}`);
  if (errorLog.length > 0) {
    console.log("\n❌  Error details:");
    for (const { path, error } of errorLog) {
      console.log(`  • ${path}`);
      console.log(`    ${error}`);
    }
  }
}

main().catch((e) => {
  console.error("Fatal:", e);
  Deno.exit(1);
});
