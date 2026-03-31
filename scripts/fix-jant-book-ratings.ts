#!/usr/bin/env -S deno run --allow-read --allow-net --allow-env --unsafely-ignore-certificate-errors

/**
 * Sync book ratings from local content files to Jant posts.
 *
 * Reads rating from each content/blog/books/*.md frontmatter,
 * matches to Jant posts in the books collection by path,
 * and updates missing/incorrect ratings.
 *
 * Usage:
 *   deno run --allow-all --unsafely-ignore-certificate-errors scripts/fix-jant-book-ratings.ts
 *   deno run --allow-all --unsafely-ignore-certificate-errors scripts/fix-jant-book-ratings.ts --dry-run
 *   deno run --allow-all --unsafely-ignore-certificate-errors scripts/fix-jant-book-ratings.ts --limit=10
 */

import "jsr:@std/dotenv/load";
import { join } from "jsr:@std/path";

const JANT_BASE_URL =
  Deno.env.get("JANT_BASE_URL") ?? "https://owen.jant.blog";
const JANT_DEV_API_TOKEN = Deno.env.get("JANT_DEV_API_TOKEN");

if (!JANT_DEV_API_TOKEN) {
  console.error("❌  JANT_DEV_API_TOKEN not set in .env");
  Deno.exit(1);
}

const COLLECTION_ID = "col_01kmygbj1sesj9njqmhs07rbm7";
const BOOKS_DIR = join(
  new URL(".", import.meta.url).pathname,
  "../content/blog/books",
);

const args = Deno.args;
const flagDryRun = args.includes("--dry-run");
const limitArg = args.find((arg) => arg.startsWith("--limit="));
const MATCH_LIMIT = limitArg ? parseInt(limitArg.split("=")[1], 10) : Infinity;

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
  rating: number | null;
  title: string | null;
  status: string;
}

interface PostsListResponse {
  posts: JantPost[];
  nextCursor: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Read local book ratings from frontmatter
// ─────────────────────────────────────────────────────────────────────────────

function extractRating(content: string): number | null {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  const ratingMatch = match[1].match(/^\s+rating:\s*(\d+)/m);
  if (!ratingMatch) return null;
  return Number(ratingMatch[1]);
}

async function loadLocalRatings(): Promise<Map<string, number>> {
  const ratings = new Map<string, number>();

  for await (const entry of Deno.readDir(BOOKS_DIR)) {
    if (!entry.isFile || !entry.name.endsWith(".md")) continue;
    if (entry.name.startsWith("_")) continue;
    // Skip English versions — rating is on the Chinese file
    if (entry.name.endsWith(".en.md")) continue;

    const content = await Deno.readTextFile(join(BOOKS_DIR, entry.name));
    const raw = extractRating(content);
    if (raw == null || raw < 1) continue;

    // Convert 10-scale to 5-scale: 10→5, 9→4, 8→4, 7→3, 6→3, 5→2
    const rating = Math.floor(raw / 2);

    // Slug as it appears in Jant: blog/books/xxx → blog-books-xxx
    const fileSlug = entry.name.replace(/\.md$/, "");
    const jantSlug = `blog-books-${fileSlug}`;
    ratings.set(jantSlug, rating);
  }

  return ratings;
}

// ─────────────────────────────────────────────────────────────────────────────
// API helpers
// ─────────────────────────────────────────────────────────────────────────────

async function* listCollectionPosts(): AsyncGenerator<JantPost> {
  let cursor: string | null = null;

  while (true) {
    const url = new URL("/api/posts", JANT_BASE_URL);
    url.searchParams.set("limit", "100");
    url.searchParams.set("collectionId", COLLECTION_ID);
    url.searchParams.set("status", "published");
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
  console.log("📚  Fix Book Ratings in Jant");
  console.log(`    URL        : ${JANT_BASE_URL}`);
  console.log(`    Collection : ${COLLECTION_ID}`);
  console.log(
    `    Limit      : ${Number.isFinite(MATCH_LIMIT) ? MATCH_LIMIT : "all"}`,
  );
  if (flagDryRun) console.log("    Mode       : DRY RUN (no writes)");
  console.log();

  // Step 1: Load local ratings
  const localRatings = await loadLocalRatings();
  console.log(`  Found ${localRatings.size} local book ratings`);
  console.log();

  // Step 2: List Jant posts and match
  let scanned = 0;
  let matched = 0;
  let updated = 0;
  let alreadyCorrect = 0;
  let noLocalRating = 0;

  for await (const post of listCollectionPosts()) {
    scanned++;

    const localRating = localRatings.get(post.slug) ?? null;

    if (localRating == null) {
      noLocalRating++;
      continue;
    }

    if (post.rating === localRating) {
      alreadyCorrect++;
      continue;
    }

    matched++;
    const label = post.title || post.slug || post.id;
    console.log(
      `  📖  ${label}  (slug: ${post.slug})`,
    );
    console.log(
      `      rating: ${post.rating ?? "null"} → ${localRating}`,
    );

    if (!flagDryRun) {
      await apiPut(`/api/posts/${post.id}`, { rating: localRating });
      updated++;
      console.log(`      ✓ Updated`);
    } else {
      console.log(`      [dry-run] Would update`);
    }

    if (matched >= MATCH_LIMIT) {
      console.log("\n    Reached match limit, stopping early.\n");
      break;
    }
  }

  console.log();
  console.log("──────────────────────────────────────────");
  console.log(
    `Summary: scanned=${scanned}, needUpdate=${matched}, updated=${updated}, alreadyCorrect=${alreadyCorrect}, noLocalRating=${noLocalRating}`,
  );
}

if (import.meta.main) {
  main().catch((error) => {
    console.error("Fatal:", error);
    Deno.exit(1);
  });
}
