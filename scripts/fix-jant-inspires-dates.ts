#!/usr/bin/env -S deno run --allow-read --allow-net --allow-env --allow-run --unsafely-ignore-certificate-errors

/**
 * Fix publish dates for Jant posts migrated from content/inspires.md.
 *
 * 1. Runs `git blame` on content/inspires.md to find the commit date for each URL.
 * 2. Fetches all Jant posts created after 2026-03-31T11:04:15.000Z.
 * 3. Matches posts to inspires.md URLs (by domain or full URL).
 * 4. Updates publishedAt to the original git blame date.
 *
 * Usage:
 *   deno run --allow-all --unsafely-ignore-certificate-errors scripts/fix-jant-inspires-dates.ts
 *   deno run --allow-all --unsafely-ignore-certificate-errors scripts/fix-jant-inspires-dates.ts --dry-run
 *   deno run --allow-all --unsafely-ignore-certificate-errors scripts/fix-jant-inspires-dates.ts --limit=10
 */

import "jsr:@std/dotenv/load";

const JANT_BASE_URL =
  Deno.env.get("JANT_BASE_URL") ?? "https://owen.jant.blog";
const JANT_DEV_API_TOKEN = Deno.env.get("JANT_DEV_API_TOKEN");

if (!JANT_DEV_API_TOKEN) {
  console.error("❌  JANT_DEV_API_TOKEN not set in .env");
  Deno.exit(1);
}

const CUTOFF_ISO = "2026-03-31T11:04:15.000Z";
const CUTOFF_EPOCH = Math.floor(new Date(CUTOFF_ISO).getTime() / 1000);

const INSPIRES_PATH = "content/inspires.md";

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
  url: string | null;
  title: string | null;
  publishedAt: number | null;
  createdAt: number;
  status: string;
  format: string;
}

interface PostsListResponse {
  posts: JantPost[];
  nextCursor: string | null;
}

interface BlameEntry {
  url: string;
  domain: string;
  authorTime: number; // unix seconds
  line: number;
  text: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 1: git blame on inspires.md to extract URL → commit date mapping
// ─────────────────────────────────────────────────────────────────────────────

async function getBlameEntries(): Promise<BlameEntry[]> {
  const cmd = new Deno.Command("git", {
    args: ["blame", "--line-porcelain", INSPIRES_PATH],
    stdout: "piped",
    stderr: "piped",
  });

  const { stdout, stderr, success } = await cmd.output();
  if (!success) {
    console.error(
      "❌  git blame failed:",
      new TextDecoder().decode(stderr),
    );
    Deno.exit(1);
  }

  const output = new TextDecoder().decode(stdout);
  const lines = output.split("\n");

  const entries: BlameEntry[] = [];
  let currentAuthorTime = 0;
  let currentLineNo = 0;

  for (const line of lines) {
    // First line of each block: <hash> <orig-line> <final-line> [<num-lines>]
    const headerMatch = line.match(/^[0-9a-f]{40}\s+\d+\s+(\d+)/);
    if (headerMatch) {
      currentLineNo = parseInt(headerMatch[1], 10);
    }

    if (line.startsWith("author-time ")) {
      currentAuthorTime = parseInt(line.slice("author-time ".length), 10);
    }

    // Content line starts with a tab
    if (line.startsWith("\t")) {
      const content = line.slice(1);
      // Extract URLs from markdown links like [text](url) or bare URLs
      const urlRegex = /https?:\/\/[^\s)>\]]+/g;
      let match;
      while ((match = urlRegex.exec(content)) !== null) {
        const url = match[0];
        try {
          const parsed = new URL(url);
          entries.push({
            url,
            domain: parsed.hostname,
            authorTime: currentAuthorTime,
            line: currentLineNo,
            text: content.trim(),
          });
        } catch {
          // skip invalid URLs
        }
      }
    }
  }

  return entries;
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 2: Fetch Jant posts created after cutoff
// ─────────────────────────────────────────────────────────────────────────────

async function* listRecentPosts(): AsyncGenerator<JantPost> {
  let cursor: string | null = null;

  while (true) {
    const url = new URL("/api/posts", JANT_BASE_URL);
    url.searchParams.set("limit", "100");
    url.searchParams.set("status", "published");
    url.searchParams.set("format", "link");
    if (cursor) url.searchParams.set("cursor", cursor);

    const response = await fetch(url, { headers: AUTH });
    if (!response.ok) {
      throw new Error(`${response.status}: ${await response.text()}`);
    }

    const json = (await response.json()) as PostsListResponse;

    for (const post of json.posts) {
      // Only yield posts created after the cutoff
      if (post.createdAt >= CUTOFF_EPOCH) {
        yield post;
      }
    }

    // If we're getting posts older than cutoff, we can stop
    if (json.posts.length > 0) {
      const oldest = json.posts[json.posts.length - 1];
      if (oldest.createdAt < CUTOFF_EPOCH) break;
    }

    if (!json.nextCursor) break;
    cursor = json.nextCursor;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 3: Match & Update
// ─────────────────────────────────────────────────────────────────────────────

function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    // Remove trailing slash, lowercase hostname
    let normalized = parsed.origin + parsed.pathname.replace(/\/+$/, "");
    normalized = normalized.toLowerCase();
    return normalized;
  } catch {
    return url.toLowerCase().replace(/\/+$/, "");
  }
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return "";
  }
}

async function main() {
  console.log("🔧  Fix Inspires Dates in Jant");
  console.log(`    URL        : ${JANT_BASE_URL}`);
  console.log(`    Cutoff     : ${CUTOFF_ISO}`);
  console.log(
    `    Limit      : ${Number.isFinite(MATCH_LIMIT) ? MATCH_LIMIT : "all"}`,
  );
  if (flagDryRun) console.log("    Mode       : DRY RUN (no writes)");
  console.log();

  // Step 1: Get blame data
  console.log("📋  Running git blame on content/inspires.md ...");
  const blameEntries = await getBlameEntries();
  console.log(`    Found ${blameEntries.length} URLs in inspires.md`);

  // Build lookup maps: exact URL → blame entry, and domain → blame entries
  const byNormalizedUrl = new Map<string, BlameEntry>();
  const byDomain = new Map<string, BlameEntry[]>();

  for (const entry of blameEntries) {
    const normalized = normalizeUrl(entry.url);
    // First occurrence wins (most specific)
    if (!byNormalizedUrl.has(normalized)) {
      byNormalizedUrl.set(normalized, entry);
    }

    const domain = entry.domain.toLowerCase();
    if (!byDomain.has(domain)) {
      byDomain.set(domain, []);
    }
    byDomain.get(domain)!.push(entry);
  }
  console.log(`    Unique normalized URLs: ${byNormalizedUrl.size}`);
  console.log(`    Unique domains: ${byDomain.size}`);
  console.log();

  // Step 2: Fetch & match Jant posts
  console.log("📡  Fetching Jant posts created after cutoff ...");
  let scanned = 0;
  let matched = 0;
  let updated = 0;
  let alreadyCorrect = 0;
  let noMatch = 0;

  for await (const post of listRecentPosts()) {
    scanned++;

    if (!post.url) {
      noMatch++;
      continue;
    }

    // Try exact URL match first
    const postNormalized = normalizeUrl(post.url);
    let blameEntry = byNormalizedUrl.get(postNormalized);

    // Fall back to domain match (pick the entry whose URL is closest)
    if (!blameEntry) {
      const postDomain = extractDomain(post.url);
      const domainEntries = byDomain.get(postDomain);
      if (domainEntries && domainEntries.length > 0) {
        // If there's exactly one, use it; otherwise try substring matching
        if (domainEntries.length === 1) {
          blameEntry = domainEntries[0];
        } else {
          // Try to find a partial URL match
          blameEntry = domainEntries.find((e) => {
            const eNorm = normalizeUrl(e.url);
            return eNorm.includes(postNormalized) ||
              postNormalized.includes(eNorm);
          });
          // If no partial match, skip (ambiguous)
          if (!blameEntry) {
            noMatch++;
            continue;
          }
        }
      } else {
        noMatch++;
        continue;
      }
    }

    const newPublishedAt = blameEntry.authorTime;
    const label = post.title || post.url || post.slug || post.id;

    // Check if already correct
    if (post.publishedAt === newPublishedAt) {
      alreadyCorrect++;
      continue;
    }

    matched++;
    const oldDate = post.publishedAt
      ? new Date(post.publishedAt * 1000).toISOString()
      : "null";
    const newDate = new Date(newPublishedAt * 1000).toISOString();

    console.log(`  🔗  ${label}`);
    console.log(`      post URL: ${post.url}`);
    console.log(`      blame URL: ${blameEntry.url}`);
    console.log(`      publishedAt: ${oldDate} → ${newDate}`);

    if (!flagDryRun) {
      const response = await fetch(`${JANT_BASE_URL}/api/posts/${post.id}`, {
        method: "PUT",
        headers: JSON_HDRS,
        body: JSON.stringify({ publishedAt: newPublishedAt }),
      });

      if (!response.ok) {
        console.error(
          `      ❌ Update failed: ${response.status}: ${await response.text()}`,
        );
      } else {
        updated++;
        console.log(`      ✓ Updated`);
      }
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
    `Summary: scanned=${scanned}, needUpdate=${matched}, updated=${updated}, alreadyCorrect=${alreadyCorrect}, noMatch=${noMatch}`,
  );
}

if (import.meta.main) {
  main().catch((error) => {
    console.error("Fatal:", error);
    Deno.exit(1);
  });
}
