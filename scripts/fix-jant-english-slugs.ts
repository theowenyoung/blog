#!/usr/bin/env -S deno run --allow-read --allow-net --allow-env --unsafely-ignore-certificate-errors

/**
 * Fix English post slugs/paths in Jant.
 *
 * The migration script set paths like:
 *   blog/adding-search.../index-en       (from index.en.md)
 *   blog/books/stolen-focus-en           (from stolen-focus.en.md)
 *
 * The correct paths should match the original owenyoung.com URLs:
 *   en/blog/adding-search...             (/en/blog/adding-search.../)
 *   en/blog/books/stolen-focus           (/en/blog/books/stolen-focus/)
 *
 * Usage:
 *   deno run --allow-all --unsafely-ignore-certificate-errors scripts/fix-jant-english-slugs.ts
 *   deno run --allow-all --unsafely-ignore-certificate-errors scripts/fix-jant-english-slugs.ts --dry-run
 *   deno run --allow-all --unsafely-ignore-certificate-errors scripts/fix-jant-english-slugs.ts --limit=5
 */

import "jsr:@std/dotenv/load";
import { walk } from "jsr:@std/fs/walk";
import { relative } from "jsr:@std/path";

const JANT_BASE_URL =
  Deno.env.get("JANT_BASE_URL") ?? "https://owen.jant.blog";
const JANT_DEV_API_TOKEN = Deno.env.get("JANT_DEV_API_TOKEN");

if (!JANT_DEV_API_TOKEN) {
  console.error("❌  JANT_DEV_API_TOKEN not set in .env");
  Deno.exit(1);
}

const BLOG_DIR = "content/blog";

const args = Deno.args;
const flagDryRun = args.includes("--dry-run");
const limitArg = args.find((arg) => arg.startsWith("--limit="));
const LIMIT = limitArg ? parseInt(limitArg.split("=")[1], 10) : Infinity;

const AUTH = {
  Authorization: `Bearer ${JANT_DEV_API_TOKEN}`,
} as Record<string, string>;
const JSON_HDRS = { ...AUTH, "Content-Type": "application/json" };

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface JantPost {
  id: string;
  slug: string;
  path: string | null;
  title: string | null;
  status: string;
}

interface PostsListResponse {
  posts: JantPost[];
  nextCursor: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Compute wrong and correct paths from source .en.md files
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Reproduce the wrong path that the migration script generated.
 * This is what toCustomPath() produced for .en.md files.
 */
function toWrongPath(relPath: string): string {
  return ("blog/" + relPath)
    .replace(/\.en\.md$/, "-en")
    .replace(/\.md$/, "")
    .replace(/\/index$/, "");
}

/**
 * Wrong path → wrong slug (Jant converts path slashes to dashes).
 */
function pathToSlug(path: string): string {
  return path.replace(/\//g, "-");
}

/**
 * Compute the correct path for an English post.
 * e.g. "adding-search.../index.en.md" → "en/blog/adding-search..."
 *      "books/stolen-focus.en.md"     → "en/blog/books/stolen-focus"
 */
function toCorrectPath(relPath: string): string {
  const withoutExt = relPath
    .replace(/\.en\.md$/, "")
    .replace(/\/index$/, "");
  return "en/blog/" + withoutExt;
}

async function scanEnglishFiles(): Promise<
  Array<{ relPath: string; wrongSlug: string; correctPath: string }>
> {
  const results: Array<{
    relPath: string;
    wrongSlug: string;
    correctPath: string;
  }> = [];

  for await (
    const entry of walk(BLOG_DIR, {
      exts: ["md"],
      includeDirs: false,
      match: [/\.en\.md$/],
    })
  ) {
    if (/_index\.en\.md$/.test(entry.path)) continue;

    const rel = relative(BLOG_DIR, entry.path);
    const wrongPath = toWrongPath(rel);
    const wrongSlug = pathToSlug(wrongPath);
    const correctPath = toCorrectPath(rel);

    results.push({ relPath: rel, wrongSlug, correctPath });
  }

  return results.sort((a, b) => a.relPath.localeCompare(b.relPath));
}

// ─────────────────────────────────────────────────────────────────────────────
// API helpers
// ─────────────────────────────────────────────────────────────────────────────

async function* listAllPosts(): AsyncGenerator<JantPost> {
  let cursor: string | null = null;

  while (true) {
    const url = new URL("/api/posts", JANT_BASE_URL);
    url.searchParams.set("limit", "100");
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
// Main
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🔧  Fix English Post Slugs in Jant");
  console.log(`    URL   : ${JANT_BASE_URL}`);
  console.log(
    `    Limit : ${Number.isFinite(LIMIT) ? LIMIT : "all"}`,
  );
  if (flagDryRun) console.log("    Mode  : DRY RUN (no writes)");
  console.log();

  // Step 1: Scan source .en.md files to build the mapping
  const englishFiles = await scanEnglishFiles();
  console.log(`  Found ${englishFiles.length} English source files\n`);

  // Build a lookup: wrongSlug → correctPath
  const slugToCorrectPath = new Map<string, { relPath: string; correctPath: string }>();
  for (const entry of englishFiles) {
    slugToCorrectPath.set(entry.wrongSlug, {
      relPath: entry.relPath,
      correctPath: entry.correctPath,
    });
  }

  // Step 2: List all Jant posts and match
  let scanned = 0;
  let matched = 0;
  let updated = 0;
  let notFound = 0;

  for await (const post of listAllPosts()) {
    scanned++;

    const mapping = slugToCorrectPath.get(post.slug);
    if (!mapping) continue;

    matched++;
    const label = post.title || post.slug || post.id;
    console.log(`  📝  ${label}`);
    console.log(`      source: ${mapping.relPath}`);
    console.log(`      slug:   ${post.slug}`);
    console.log(`      path:   ${post.path ?? "(none)"} → ${mapping.correctPath}`);

    if (!flagDryRun) {
      await apiPut(`/api/posts/${post.id}`, { path: mapping.correctPath });
      updated++;
      console.log(`      ✓ Updated`);
    } else {
      console.log(`      [dry-run] Would update`);
    }

    // Remove from map so we can report unmatched at the end
    slugToCorrectPath.delete(post.slug);

    if (updated >= LIMIT || (flagDryRun && matched >= LIMIT)) {
      console.log("\n    Reached limit, stopping early.\n");
      break;
    }
  }

  // Report any source files that weren't found in Jant
  const unmatched = [...slugToCorrectPath.entries()];
  if (unmatched.length > 0) {
    notFound = unmatched.length;
    console.log(`\n  ⚠️  ${notFound} English files not found in Jant (may not have been migrated yet):`);
    for (const [slug, { relPath }] of unmatched) {
      console.log(`      ${relPath}  (expected slug: ${slug})`);
    }
  }

  console.log();
  console.log("──────────────────────────────────────────");
  console.log(
    `Summary: scanned=${scanned}, matched=${matched}, updated=${updated}, notFoundInJant=${notFound}`,
  );
}

if (import.meta.main) {
  main().catch((error) => {
    console.error("Fatal:", error);
    Deno.exit(1);
  });
}
