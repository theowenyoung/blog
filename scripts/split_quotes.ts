#!/usr/bin/env -S deno run --allow-read --allow-write --allow-run

/**
 * Split quotes.md into individual markdown files under content/blog/quotes/
 * Uses git blame to determine when each quote was added.
 * Extracts source_name and url from each quote's attribution.
 */

const QUOTES_FILE = new URL("../content/quotes.md", import.meta.url).pathname;
const OUTPUT_DIR = new URL("../content/blog/quotes/", import.meta.url).pathname;

// ─── Step 1: Get git blame dates ────────────────────────────────────────────

interface BlameLine {
  lineNum: number;
  date: string; // YYYY-MM-DD
  isoDate: string; // full ISO date
}

async function getBlameData(): Promise<Map<number, BlameLine>> {
  const cmd = new Deno.Command("git", {
    args: ["blame", "--porcelain", QUOTES_FILE],
    stdout: "piped",
    stderr: "piped",
  });
  const output = await cmd.output();
  const text = new TextDecoder().decode(output.stdout);
  const lines = text.split("\n");

  const result = new Map<number, BlameLine>();
  let currentLineNum = 0;
  let currentTimestamp = 0;
  let currentTz = "+0000";

  for (const line of lines) {
    // Hash line: "<hash> <orig-line> <final-line> [<num-lines>]"
    const hashMatch = line.match(
      /^[0-9a-f]{40}\s+\d+\s+(\d+)/
    );
    if (hashMatch) {
      currentLineNum = parseInt(hashMatch[1]);
      continue;
    }

    if (line.startsWith("author-time ")) {
      currentTimestamp = parseInt(line.slice("author-time ".length));
      continue;
    }

    if (line.startsWith("author-tz ")) {
      currentTz = line.slice("author-tz ".length).trim();
      continue;
    }

    // Content line starts with \t
    if (line.startsWith("\t")) {
      const date = new Date(currentTimestamp * 1000);
      // Apply timezone offset to get local date
      const tzSign = currentTz[0] === "+" ? 1 : -1;
      const tzHours = parseInt(currentTz.slice(1, 3));
      const tzMinutes = parseInt(currentTz.slice(3, 5));
      const offsetMs = tzSign * (tzHours * 60 + tzMinutes) * 60 * 1000;
      const localDate = new Date(date.getTime() + offsetMs);

      const yyyy = localDate.getUTCFullYear();
      const mm = String(localDate.getUTCMonth() + 1).padStart(2, "0");
      const dd = String(localDate.getUTCDate()).padStart(2, "0");
      const hh = String(localDate.getUTCHours()).padStart(2, "0");
      const min = String(localDate.getUTCMinutes()).padStart(2, "0");
      const ss = String(localDate.getUTCSeconds()).padStart(2, "0");

      result.set(currentLineNum, {
        lineNum: currentLineNum,
        date: `${yyyy}-${mm}-${dd}`,
        isoDate: `${yyyy}-${mm}-${dd}T${hh}:${min}:${ss}${currentTz.slice(0, 3)}:${currentTz.slice(3)}`,
      });
    }
  }
  return result;
}

// ─── Step 2: Parse quotes.md ────────────────────────────────────────────────

interface Quote {
  rawLines: string[]; // original lines with `> ` prefix
  startLine: number; // 1-based line number in the file
  sectionHeader: string | null; // ## header if in a book section
  sectionUrl: string | null; // From: <url> if in a book section
}

function parseQuotesFile(content: string): Quote[] {
  const lines = content.split("\n");
  const quotes: Quote[] = [];

  // Skip frontmatter
  let i = 0;
  if (lines[0]?.trim() === "---") {
    i = 1;
    while (i < lines.length && lines[i]?.trim() !== "---") i++;
    i++; // skip closing ---
  }

  let currentSection: string | null = null;
  let currentSectionUrl: string | null = null;
  let currentBlock: string[] = [];
  let blockStartLine = 0;

  for (; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    const lineNum = i + 1; // 1-based

    // Skip <!-- more -->
    if (trimmed === "<!-- more -->") continue;

    // Section headers
    if (trimmed.startsWith("## ")) {
      // Flush current block
      if (currentBlock.length > 0) {
        quotes.push({
          rawLines: currentBlock,
          startLine: blockStartLine,
          sectionHeader: currentSection,
          sectionUrl: currentSectionUrl,
        });
        currentBlock = [];
      }
      currentSection = trimmed.slice(3).trim();
      currentSectionUrl = null;
      continue;
    }

    // "From: <url>" or "> 来自: <url>" lines for book sections
    const fromMatch = trimmed.match(/^From:\s*<?([^>]+)>?\s*$/);
    if (fromMatch) {
      currentSectionUrl = fromMatch[1];
      continue;
    }

    // Plain text lines (non-blockquote, non-header, non-empty)
    // These could be section titles, numbered lists, etc.
    if (
      trimmed !== "" &&
      !trimmed.startsWith(">") &&
      !trimmed.startsWith("-") &&
      !trimmed.startsWith("1.") &&
      !trimmed.startsWith("2.") &&
      !trimmed.startsWith("3.")
    ) {
      // Flush current block if any
      if (currentBlock.length > 0) {
        quotes.push({
          rawLines: currentBlock,
          startLine: blockStartLine,
          sectionHeader: currentSection,
          sectionUrl: currentSectionUrl,
        });
        currentBlock = [];
      }
      // Treat as section title (similar to ## headers but without the ##)
      currentSection = trimmed;
      currentSectionUrl = null;
      continue;
    }

    // Blockquote lines
    if (trimmed.startsWith(">")) {
      if (currentBlock.length === 0) {
        blockStartLine = lineNum;
      }
      currentBlock.push(trimmed);
      continue;
    }

    // Empty line - end of block
    if (trimmed === "") {
      if (currentBlock.length > 0) {
        // Check if this block is just a "来自:" or "From:" line (section URL metadata)
        const blockContent = currentBlock
          .map((l) => (l.startsWith("> ") ? l.slice(2) : l.startsWith(">") ? l.slice(1) : l))
          .join("")
          .trim();
        const fromBlockMatch = blockContent.match(/^(?:来自|From):?\s*<?([^>]+)>?\s*$/);
        if (fromBlockMatch) {
          currentSectionUrl = fromBlockMatch[1];
          currentBlock = [];
          continue;
        }
        quotes.push({
          rawLines: currentBlock,
          startLine: blockStartLine,
          sectionHeader: currentSection,
          sectionUrl: currentSectionUrl,
        });
        currentBlock = [];
      }
      continue;
    }

    // Other content (numbered lists in non-quote context, etc.)
    // If we're in a block, append; otherwise skip
    if (currentBlock.length > 0) {
      currentBlock.push(trimmed);
    }
  }

  // Flush last block
  if (currentBlock.length > 0) {
    quotes.push({
      rawLines: currentBlock,
      startLine: blockStartLine,
      sectionHeader: currentSection,
      sectionUrl: currentSectionUrl,
    });
  }

  return quotes;
}

// ─── Step 3: Extract source info ────────────────────────────────────────────

interface SourceInfo {
  sourceName: string | null;
  url: string | null;
  body: string;
}

function extractSource(rawLines: string[], sectionHeader: string | null, sectionUrl: string | null): SourceInfo {
  // Strip `> ` prefix from all lines
  const stripped = rawLines.map((l) => {
    if (l.startsWith("> ")) return l.slice(2);
    if (l.startsWith(">")) return l.slice(1);
    return l;
  });

  // For book section quotes, if the first line is "来自: <url>" or "From: <url>", skip it
  let startIdx = 0;
  const firstLine = stripped[0]?.trim();
  const fromInQuote = firstLine?.match(/^(?:来自|From):?\s*<?([^>]+)>?\s*$/);
  if (fromInQuote) {
    if (!sectionUrl) sectionUrl = fromInQuote[1];
    startIdx = 1;
    // Skip empty lines after "来自"/"From"
    while (startIdx < stripped.length && stripped[startIdx].trim() === "") {
      startIdx++;
    }
  }

  const bodyLines = stripped.slice(startIdx);

  // Try to find source at the end of the quote
  // Work backwards from the last non-empty line
  let lastIdx = bodyLines.length - 1;
  while (lastIdx >= 0 && bodyLines[lastIdx].trim() === "") lastIdx--;
  if (lastIdx < 0) {
    return {
      sourceName: sectionHeader,
      url: sectionUrl,
      body: bodyLines.join("\n").trim(),
    };
  }

  const lastLine = bodyLines[lastIdx].trim();

  // Try to extract source from last line(s)
  const result = tryExtractSourceFromEnd(bodyLines, lastIdx);

  if (result) {
    return {
      sourceName: result.sourceName || sectionHeader,
      url: result.url || sectionUrl,
      body: result.body,
    };
  }

  // No source found in the quote itself; use section info
  return {
    sourceName: sectionHeader,
    url: sectionUrl,
    body: bodyLines.join("\n").trim(),
  };
}

interface ExtractResult {
  sourceName: string | null;
  url: string | null;
  body: string;
}

function tryExtractSourceFromEnd(
  lines: string[],
  lastIdx: number
): ExtractResult | null {
  const lastLine = lines[lastIdx].trim();

  // Pattern 1: Standalone source line with separator
  // "—— Name", "-- Name", "- Name", "── Name"
  // Can include [source](url) or [Name](url) or 《Book》
  const separatorPattern =
    /^[-—–─]+\s*(.+)$/;

  // Pattern 2: Source at end of content line with separator
  // "...content - Name", "...content -- Name"
  const inlineSeparatorPattern =
    /^(.+?)\s+[-—–─]+\s+(.+)$/;

  // Check if last line is a standalone source line (starts with separator)
  const standaloneMatch = lastLine.match(separatorPattern);
  if (standaloneMatch) {
    const sourceStr = standaloneMatch[1].trim();
    const { name, url } = parseSourceString(sourceStr);
    const bodyLines = lines.slice(0, lastIdx);
    // Remove trailing empty lines
    while (bodyLines.length > 0 && bodyLines[bodyLines.length - 1].trim() === "") {
      bodyLines.pop();
    }
    // Also clean trailing separators from body
    const body = cleanTrailingSeparator(bodyLines.join("\n").trim());
    return { sourceName: name, url, body };
  }

  // Check if last line has inline source
  const inlineMatch = lastLine.match(inlineSeparatorPattern);
  if (inlineMatch) {
    const contentPart = inlineMatch[1].trim();
    const sourceStr = inlineMatch[2].trim();
    const { name, url } = parseSourceString(sourceStr);
    const bodyLines = [...lines.slice(0, lastIdx), contentPart];
    const body = bodyLines.join("\n").trim();
    return { sourceName: name, url, body };
  }

  // Check second-to-last line (source might be on its own line after a blank-ish gap)
  // Check if last line is just a [source](url) or [Name](url)
  const linkOnlyMatch = lastLine.match(
    /^\[([^\]]*)\]\(([^)]+)\)\s*$/
  );
  if (linkOnlyMatch) {
    const linkText = linkOnlyMatch[1];
    const linkUrl = linkOnlyMatch[2];
    const bodyLines = lines.slice(0, lastIdx);
    while (bodyLines.length > 0 && bodyLines[bodyLines.length - 1].trim() === "") {
      bodyLines.pop();
    }
    const body = cleanTrailingSeparator(bodyLines.join("\n").trim());
    const name = linkText.toLowerCase() === "source" ? null : linkText;
    return { sourceName: name, url: linkUrl, body };
  }

  // Check if second-to-last has the separator+source pattern (when last line is continuation)
  if (lastIdx >= 1) {
    const secondLast = lines[lastIdx - 1].trim();
    // Check if the second-to-last + last together form a source
    // e.g., line N-1: "...content -", line N: "Name"
    // or line N-1: "—— Source Part1", line N: "Source Part2"
    const combinedSource = secondLast + " " + lastLine;
    const combinedInline = combinedSource.match(inlineSeparatorPattern);
    if (combinedInline) {
      const contentPart = combinedInline[1].trim();
      const sourceStr = combinedInline[2].trim();
      const { name, url } = parseSourceString(sourceStr);
      const bodyLines = [...lines.slice(0, lastIdx - 1), contentPart];
      const body = bodyLines.join("\n").trim();
      return { sourceName: name, url, body };
    }
  }

  return null;
}

function parseSourceString(str: string): { name: string | null; url: string | null } {
  // Pattern: [source](url) or [Source](url)
  const sourceLinkMatch = str.match(
    /^\[([^\]]*)\]\(([^)]+)\)\s*$/
  );
  if (sourceLinkMatch) {
    const text = sourceLinkMatch[1].trim();
    const url = sourceLinkMatch[2].trim();
    const name = text.toLowerCase() === "source" ? null : text;
    return { name, url };
  }

  // Pattern: Name [source](url) or Name ([source](url))
  const nameWithLinkMatch = str.match(
    /^(.+?)\s*\(?(\[([^\]]*)\]\(([^)]+)\))\)?\s*$/
  );
  if (nameWithLinkMatch) {
    const namePart = nameWithLinkMatch[1].trim();
    const linkText = nameWithLinkMatch[3]?.trim();
    const linkUrl = nameWithLinkMatch[4]?.trim();
    // If link text is "source" or similar, name is the prefix part
    const name = namePart || (linkText?.toLowerCase() === "source" ? null : linkText) || null;
    return { name: name || null, url: linkUrl || null };
  }

  // Pattern: Name《Book》or 《Book》
  const bookMatch = str.match(/^(.*)$/);
  if (bookMatch) {
    const name = str.trim() || null;
    return { name, url: null };
  }

  return { name: str.trim() || null, url: null };
}

function cleanTrailingSeparator(body: string): string {
  return body.replace(/\s*[-—–─]+\s*$/, "").trim();
}

// ─── Step 4: Generate files ─────────────────────────────────────────────────

async function main() {
  console.log("Running git blame...");
  const blameData = await getBlameData();

  console.log("Parsing quotes.md...");
  const content = await Deno.readTextFile(QUOTES_FILE);
  const quotes = parseQuotesFile(content);
  console.log(`Found ${quotes.length} quote blocks`);

  // Process each quote
  interface ProcessedQuote {
    date: string;
    isoDate: string;
    sourceName: string | null;
    url: string | null;
    body: string;
  }

  const processed: ProcessedQuote[] = [];
  const errors: string[] = [];

  for (let i = 0; i < quotes.length; i++) {
    const q = quotes[i];

    // Get date from git blame for the first line of this quote
    const blame = blameData.get(q.startLine);
    if (!blame) {
      errors.push(
        `Error: No blame data for quote #${i + 1} at line ${q.startLine}: "${q.rawLines[0]?.slice(0, 60)}..."`
      );
      continue;
    }

    const { sourceName, url, body } = extractSource(
      q.rawLines,
      q.sectionHeader,
      q.sectionUrl
    );

    if (!body.trim()) {
      continue; // Skip empty quotes
    }

    processed.push({
      date: blame.date,
      isoDate: blame.isoDate,
      sourceName: sourceName,
      url: url,
      body: body.trim(),
    });
  }

  if (errors.length > 0) {
    console.error("\n=== ERRORS ===");
    for (const err of errors) {
      console.error(err);
    }
  }

  // Count dates for naming
  const dateCount: Record<string, number> = {};
  for (const q of processed) {
    dateCount[q.date] = (dateCount[q.date] || 0) + 1;
  }

  // Assign filenames and write
  const dateIndex: Record<string, number> = {};
  await Deno.mkdir(OUTPUT_DIR, { recursive: true });
  let written = 0;

  for (const q of processed) {
    if (!dateIndex[q.date]) dateIndex[q.date] = 0;
    dateIndex[q.date]++;

    let filename: string;
    if (dateCount[q.date] === 1) {
      filename = `${q.date}.md`;
    } else {
      filename = `${q.date}-${dateIndex[q.date]}.md`;
    }

    // Build frontmatter
    let frontmatter = `---
title: Untitled
date: ${q.isoDate}
updated: ${q.date}
taxonomies:
  categories:
    - Quotes`;

    if (q.sourceName || q.url) {
      frontmatter += `\nextra:`;
      if (q.sourceName) {
        // Escape quotes in YAML
        const escaped = q.sourceName.replace(/"/g, '\\"');
        frontmatter += `\n  source_name: "${escaped}"`;
      }
      if (q.url) {
        frontmatter += `\n  url: "${q.url}"`;
      }
    }

    frontmatter += `\n---`;

    const fileContent = `${frontmatter}\n\n${q.body}\n`;
    const filePath = `${OUTPUT_DIR}${filename}`;
    await Deno.writeTextFile(filePath, fileContent);
    written++;
  }

  console.log(`\nDone! Generated ${written} quote files in ${OUTPUT_DIR}`);

  // Summary by year
  const yearCounts: Record<string, number> = {};
  for (const q of processed) {
    const year = q.date.slice(0, 4);
    yearCounts[year] = (yearCounts[year] || 0) + 1;
  }
  console.log("\nBy year (git commit date):");
  for (const [year, count] of Object.entries(yearCounts).sort()) {
    console.log(`  ${year}: ${count} quotes`);
  }
}

main();
