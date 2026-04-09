#!/usr/bin/env -S deno run --allow-read --allow-net --allow-env --unsafely-ignore-certificate-errors

/**
 * Find Jant posts whose body (trimmed plain text) is exactly "(双语机翻译文)"
 * and set their body to null.
 *
 * Usage:
 *   deno run --allow-all --unsafely-ignore-certificate-errors scripts/clean-jant-bilingual-placeholder.ts
 *   deno run --allow-all --unsafely-ignore-certificate-errors scripts/clean-jant-bilingual-placeholder.ts --dry-run
 *   deno run --allow-all --unsafely-ignore-certificate-errors scripts/clean-jant-bilingual-placeholder.ts --format=note|link|quote|all
 *   deno run --allow-all --unsafely-ignore-certificate-errors scripts/clean-jant-bilingual-placeholder.ts --status=published|draft|all
 *   deno run --allow-all --unsafely-ignore-certificate-errors scripts/clean-jant-bilingual-placeholder.ts --limit=10
 */

import "jsr:@std/dotenv/load";

const JANT_BASE_URL =
  Deno.env.get("JANT_BASE_URL") ?? "https://jant.localtest.me";
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
const FORMAT_FILTER = formatArg?.split("=")[1] ?? "all";
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

const PLACEHOLDER = "(双语机翻译文)";

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
// Plain text extraction from ProseMirror JSON
// ─────────────────────────────────────────────────────────────────────────────

// deno-lint-ignore no-explicit-any
type DocNode = Record<string, any>;

function extractPlainText(bodyJson: string): string {
  let doc: DocNode;
  try {
    doc = JSON.parse(bodyJson);
  } catch {
    return "";
  }

  const parts: string[] = [];

  function walk(node: DocNode) {
    if (node.type === "text" && typeof node.text === "string") {
      parts.push(node.text);
    }
    if (Array.isArray(node.content)) {
      for (const child of node.content) walk(child);
    }
  }

  walk(doc);
  return parts.join("").trim();
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  const statuses: PostStatus[] =
    STATUS_FILTER === "all"
      ? ["published", "draft"]
      : [STATUS_FILTER as PostStatus];

  console.log("🧹  Clean bilingual placeholder bodies in Jant Posts");
  console.log(`    URL    : ${JANT_BASE_URL}`);
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

  for (const status of statuses) {
    for await (const post of listPosts(status)) {
      if (FORMAT_FILTER !== "all" && post.format !== FORMAT_FILTER) continue;

      scanned++;

      if (!post.body) continue;

      const plainText = extractPlainText(post.body);
      if (plainText !== PLACEHOLDER) continue;

      matched++;
      console.log(
        `  📄  ${post.slug || post.id} (${post.format}, ${post.status})`,
      );

      if (!flagDryRun) {
        await apiPut(`/api/posts/${post.id}`, { body: null });
        updated++;
        console.log(`    ✓ Body set to null`);
      } else {
        console.log(`    [dry-run] Would set body to null`);
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
    `Summary: scanned=${scanned}, matched=${matched}, updated=${updated}`,
  );
}

if (import.meta.main) {
  main().catch((error) => {
    console.error("Fatal:", error);
    Deno.exit(1);
  });
}
