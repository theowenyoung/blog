#!/usr/bin/env -S deno run --allow-read --allow-net --allow-env --unsafely-ignore-certificate-errors

/**
 * Fix malformed absolute media URLs created by older Jant migration runs.
 *
 * Example broken URL:
 *   https://owen.jant.bloghttps://media.jant.me/media/...
 *
 * Usage:
 *   deno run --allow-all --unsafely-ignore-certificate-errors scripts/fix-jant-broken-media-urls.ts
 *   deno run --allow-all --unsafely-ignore-certificate-errors scripts/fix-jant-broken-media-urls.ts --dry-run
 *   deno run --allow-all --unsafely-ignore-certificate-errors scripts/fix-jant-broken-media-urls.ts --status=published|draft|all
 *   deno run --allow-all --unsafely-ignore-certificate-errors scripts/fix-jant-broken-media-urls.ts --limit=10
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
const limitArg = args.find((arg) => arg.startsWith("--limit="));

const STATUS_FILTER = statusArg?.split("=")[1] ?? "all";
const MATCH_LIMIT = limitArg ? parseInt(limitArg.split("=")[1], 10) : Infinity;

if (!["all", "published", "draft"].includes(STATUS_FILTER)) {
  console.error("❌  --status must be one of: published, draft, all");
  Deno.exit(1);
}

const AUTH = {
  Authorization: `Bearer ${JANT_DEV_API_TOKEN}`,
} as Record<string, string>;
const JSON_HDRS = { ...AUTH, "Content-Type": "application/json" };

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

function buildBrokenUrlPrefixes(baseUrl: string): string[] {
  const normalizedBase = baseUrl.replace(/\/+$/, "");
  const prefixes = new Set<string>([normalizedBase]);

  try {
    prefixes.add(new URL(normalizedBase).origin);
  } catch {
    // Ignore invalid base URL here; fetch will fail later with a clearer error.
  }

  return Array.from(prefixes);
}

const BROKEN_URL_PREFIXES = buildBrokenUrlPrefixes(JANT_BASE_URL);

function replaceBrokenAbsoluteUrls(
  value: string,
): { value: string; replacements: number } {
  let result = value;
  let replacements = 0;

  for (const prefix of BROKEN_URL_PREFIXES) {
    const pairs: Array<[string, string]> = [
      [`${prefix}https://`, "https://"],
      [`${prefix}http://`, "http://"],
      [`${prefix}https//`, "https://"],
      [`${prefix}http//`, "http://"],
    ];

    for (const [from, to] of pairs) {
      if (!result.includes(from)) continue;
      replacements += result.split(from).length - 1;
      result = result.split(from).join(to);
    }
  }

  return { value: result, replacements };
}

async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${JANT_BASE_URL}${path}`, {
    headers: AUTH,
  });

  if (!response.ok) {
    throw new Error(`${response.status}: ${await response.text()}`);
  }

  return response.json();
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

function formatFieldSummary(fieldReplacements: Record<string, number>): string {
  return Object.entries(fieldReplacements)
    .map(([field, count]) => `${field} x${count}`)
    .join(", ");
}

async function *listPosts(status: PostStatus): AsyncGenerator<JantPostListItem> {
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

    const json = await response.json() as PostsListResponse;

    for (const post of json.posts) {
      yield post;
    }

    if (!json.nextCursor) break;
    cursor = json.nextCursor;
  }
}

async function main() {
  const statuses: PostStatus[] = STATUS_FILTER === "all"
    ? ["published", "draft"]
    : [STATUS_FILTER as PostStatus];

  console.log("🔧  Fix Broken Jant Media URLs");
  console.log(`    URL    : ${JANT_BASE_URL}`);
  console.log(`    Status : ${statuses.join(", ")}`);
  console.log(
    `    Limit  : ${Number.isFinite(MATCH_LIMIT) ? MATCH_LIMIT : "all matches"}`,
  );
  if (flagDryRun) console.log("    Mode   : DRY RUN (no writes)");
  console.log();

  let scanned = 0;
  let matched = 0;
  let updated = 0;
  let skippedHtmlOnly = 0;

  for (const status of statuses) {
    for await (const post of listPosts(status)) {
      scanned += 1;

      const payload: Record<string, string> = {};
      const fieldReplacements: Record<string, number> = {};

      if (post.body) {
        const fixed = replaceBrokenAbsoluteUrls(post.body);
        if (fixed.replacements > 0) {
          payload.body = fixed.value;
          fieldReplacements.body = fixed.replacements;
        }
      }

      if (post.format === "quote" && post.sourceUrl) {
        const fixed = replaceBrokenAbsoluteUrls(post.sourceUrl);
        if (fixed.replacements > 0) {
          payload.sourceUrl = fixed.value;
          fieldReplacements.sourceUrl = fixed.replacements;
        }
      } else if (post.url) {
        const fixed = replaceBrokenAbsoluteUrls(post.url);
        if (fixed.replacements > 0) {
          payload.url = fixed.value;
          fieldReplacements.url = fixed.replacements;
        }
      }

      const htmlOnlyHit = !Object.keys(payload).length && post.bodyHtml
        ? replaceBrokenAbsoluteUrls(post.bodyHtml).replacements > 0
        : false;

      if (!Object.keys(payload).length) {
        if (htmlOnlyHit) {
          skippedHtmlOnly += 1;
          console.warn(
            `    ⚠️   HTML-only hit skipped: ${post.slug} (${post.id})`,
          );
        }
        continue;
      }

      matched += 1;
      const summary = formatFieldSummary(fieldReplacements);

      if (flagDryRun) {
        console.log(
          `    [dry-run] ${post.slug} (${post.id}) -> ${summary}`,
        );
      } else {
        await apiPut(`/api/posts/${post.id}`, payload);
        updated += 1;
        console.log(`    ✓ Updated ${post.slug} (${post.id}) -> ${summary}`);
      }

      if (matched >= MATCH_LIMIT) {
        console.log();
        console.log("    Reached match limit, stopping early.");
        console.log();
        console.log(
          `Summary: scanned=${scanned}, matched=${matched}, updated=${updated}, htmlOnlySkipped=${skippedHtmlOnly}`,
        );
        return;
      }
    }
  }

  console.log(
    `Summary: scanned=${scanned}, matched=${matched}, updated=${updated}, htmlOnlySkipped=${skippedHtmlOnly}`,
  );
}

if (import.meta.main) {
  main().catch((error) => {
    console.error("Fatal:", error);
    Deno.exit(1);
  });
}
