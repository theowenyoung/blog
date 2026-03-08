#!/usr/bin/env -S deno run --allow-read --allow-write

/**
 * Split thoughts.md into individual markdown files under content/blog/thoughts/
 * Each thought becomes a separate file named by its date (e.g., 2022-03-19.md)
 * If multiple thoughts share the same date, they get suffixed: 2022-03-19-1.md, 2022-03-19-2.md
 */

const THOUGHTS_FILE = new URL(
  "../content/thoughts.md",
  import.meta.url
).pathname;
const OUTPUT_DIR = new URL(
  "../content/blog/thoughts/",
  import.meta.url
).pathname;

// Read the file
const content = await Deno.readTextFile(THOUGHTS_FILE);
const lines = content.split("\n");

// Skip frontmatter
let i = 0;
if (lines[0]?.trim() === "---") {
  i = 1;
  while (i < lines.length && lines[i]?.trim() !== "---") {
    i++;
  }
  i++; // skip closing ---
}

// Parse thoughts: each thought is a consecutive block of `>` lines separated by blank lines
interface Thought {
  lines: string[];
  date: string | null; // YYYY-MM-DD format
}

const thoughts: Thought[] = [];
let currentLines: string[] = [];

for (; i < lines.length; i++) {
  const line = lines[i];
  const trimmed = line.trim();

  // Skip <!-- more --> markers
  if (trimmed === "<!-- more -->") continue;

  if (trimmed.startsWith(">")) {
    currentLines.push(trimmed);
  } else if (trimmed === "") {
    if (currentLines.length > 0) {
      thoughts.push({ lines: currentLines, date: null });
      currentLines = [];
    }
  } else {
    // Non-blockquote, non-empty line - probably continuation or something unexpected
    // Append to current block if exists
    if (currentLines.length > 0) {
      currentLines.push(trimmed);
    }
  }
}
// Don't forget the last block
if (currentLines.length > 0) {
  thoughts.push({ lines: currentLines, date: null });
}

/**
 * Parse a date string in various formats to YYYY-MM-DD
 * Supports: 2022.03.19, 2022-03-19, 2022/03/19, 2022.3.4, etc.
 */
function parseDate(dateStr: string): string | null {
  // Remove trailing punctuation like : or , (including Chinese punctuation)
  dateStr = dateStr.replace(/[,:;！!。，：；]+$/, "").trim();

  // Try YYYY.M.D or YYYY-M-D or YYYY/M/D
  const m = dateStr.match(/^(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})$/);
  if (m) {
    const year = m[1];
    const month = m[2].padStart(2, "0");
    const day = m[3].padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  return null;
}

/**
 * Try to extract a date from the thought's lines.
 * Date patterns at the end of a thought:
 *   - "... - 2024.05.26"
 *   - "... -- 2024.10.22"
 *   - "... —— 2024.04.24"
 *   - "> 2025.02.03" (standalone date line in blockquote)
 *   - "... -2024.05.16" (no space after dash)
 *   - "... --2023.12.25" (no space)
 *
 * Returns [date, cleanedLines] or [null, originalLines]
 */
function extractDate(
  rawLines: string[]
): { date: string | null; body: string } {
  // Join all lines, strip leading `> ` or `>` from each line
  const strippedLines = rawLines.map((l) => {
    if (l.startsWith("> ")) return l.slice(2);
    if (l.startsWith(">")) return l.slice(1);
    return l;
  });

  // Check from the last line backwards for a date
  // Strategy: Try to find a date pattern in the last few lines

  // First, try the last line as a standalone date
  const lastLine = strippedLines[strippedLines.length - 1].trim();

  // Pattern: standalone date line (possibly with leading separators)
  const standaloneDateMatch = lastLine.match(
    /^[-—–\s]*(\d{4}[.\-/]\d{1,2}[.\-/]\d{1,2})[,:;，：；]*\s*$/
  );
  if (standaloneDateMatch) {
    const date = parseDate(standaloneDateMatch[1]);
    if (date) {
      const bodyLines = strippedLines.slice(0, -1);
      // Remove trailing empty lines
      while (bodyLines.length > 0 && bodyLines[bodyLines.length - 1].trim() === "") {
        bodyLines.pop();
      }
      return { date, body: cleanBody(bodyLines.join("\n").trim()) };
    }
  }

  // Pattern: date at end of last line with separator
  // e.g., "... - 2024.05.26", "... -- 2024.10.22", "... —— 2024.04.24"
  // Also: "... -2024.05.16", "... --2023.12.25"
  // Also handles Chinese commas: "... - 2024/04/17，"
  const endDateMatch = lastLine.match(
    /\s*[-—–]+\s*(\d{4}[.\-/]\d{1,2}[.\-/]\d{1,2})[,:;，：；]*\s*$/
  );
  if (endDateMatch) {
    const date = parseDate(endDateMatch[1]);
    if (date) {
      // Remove the date part from the last line
      const cleanedLast = lastLine
        .replace(/\s*[-—–]+\s*(\d{4}[.\-/]\d{1,2}[.\-/]\d{1,2})[,:;，：；]*\s*$/, "")
        .trim();
      const bodyLines = [...strippedLines.slice(0, -1)];
      if (cleanedLast) {
        bodyLines.push(cleanedLast);
      }
      return { date, body: cleanBody(bodyLines.join("\n").trim()) };
    }
  }

  // Also check second-to-last line for the patterns above (some multi-line thoughts
  // end with date on a continuation line after the main content)
  if (strippedLines.length >= 2) {
    const secondLast = strippedLines[strippedLines.length - 2].trim();
    // Check if last line is empty or whitespace and second-to-last has date
    if (lastLine === "" || lastLine.match(/^\s*$/)) {
      const match2 = secondLast.match(
        /\s*[-—–]+\s*(\d{4}[.\-/]\d{1,2}[.\-/]\d{1,2})[,:;，：；]*\s*$/
      );
      if (match2) {
        const date = parseDate(match2[1]);
        if (date) {
          const cleanedLine = secondLast
            .replace(/\s*[-—–]+\s*(\d{4}[.\-/]\d{1,2}[.\-/]\d{1,2})[,:;，：；]*\s*$/, "")
            .trim();
          const bodyLines = [...strippedLines.slice(0, -2)];
          if (cleanedLine) {
            bodyLines.push(cleanedLine);
          }
          return { date, body: cleanBody(bodyLines.join("\n").trim()) };
        }
      }
    }
  }

  // Check if the last line contains a date with other patterns
  // Pattern with [source](url) after date: "... - 2024/04/17, [source](...)"
  // We already handle trailing comma, but let's also handle [source] links after date
  for (let j = strippedLines.length - 1; j >= Math.max(0, strippedLines.length - 3); j--) {
    const line = strippedLines[j].trim();
    // Pattern: separator + date + optional punctuation + optional [source](url)
    const inlineMatch = line.match(
      /\s*[-—–]+\s*(\d{4}[.\-/]\d{1,2}[.\-/]\d{1,2})[,:;，：；]*\s*(?:\[.*?\]\(.*?\)\s*)?$/
    );
    if (inlineMatch) {
      const date = parseDate(inlineMatch[1]);
      if (date) {
        const cleanedLine = line
          .replace(/\s*[-—–]+\s*(\d{4}[.\-/]\d{1,2}[.\-/]\d{1,2})[,:;，：；]*\s*(?:\[.*?\]\(.*?\)\s*)?$/, "")
          .trim();
        const bodyLines = [...strippedLines.slice(0, j)];
        if (cleanedLine) {
          bodyLines.push(cleanedLine);
        }
        bodyLines.push(...strippedLines.slice(j + 1));
        // Remove trailing empty lines
        while (bodyLines.length > 0 && bodyLines[bodyLines.length - 1].trim() === "") {
          bodyLines.pop();
        }
        return { date, body: cleanBody(bodyLines.join("\n").trim()) };
      }
    }
  }

  // Check for date at start of line followed by optional content (like source links)
  // Pattern: "2024.01.24, [source](...)" or just "2025.02.03"
  for (let j = strippedLines.length - 1; j >= Math.max(0, strippedLines.length - 3); j--) {
    const line = strippedLines[j].trim();
    const startDateMatch = line.match(
      /^[-—–\s]*(\d{4}[.\-/]\d{1,2}[.\-/]\d{1,2})[,:;，：；]*\s*(?:\[.*?\]\(.*?\)\s*)?$/
    );
    if (startDateMatch) {
      const date = parseDate(startDateMatch[1]);
      if (date) {
        const bodyLines = [...strippedLines.slice(0, j), ...strippedLines.slice(j + 1)];
        while (bodyLines.length > 0 && bodyLines[bodyLines.length - 1].trim() === "") {
          bodyLines.pop();
        }
        return { date, body: cleanBody(bodyLines.join("\n").trim()) };
      }
    }
  }

  // Also check for standalone date on line (without separators) in the last 3 lines
  for (let j = strippedLines.length - 1; j >= Math.max(0, strippedLines.length - 3); j--) {
    const line = strippedLines[j].trim();
    const standaloneMatch = line.match(
      /^[-—–\s]*(\d{4}[.\-/]\d{1,2}[.\-/]\d{1,2})[,:;，：；]*\s*$/
    );
    if (standaloneMatch) {
      const date = parseDate(standaloneMatch[1]);
      if (date) {
        const bodyLines = [...strippedLines.slice(0, j), ...strippedLines.slice(j + 1)];
        while (bodyLines.length > 0 && bodyLines[bodyLines.length - 1].trim() === "") {
          bodyLines.pop();
        }
        return { date, body: cleanBody(bodyLines.join("\n").trim()) };
      }
    }
  }

  return { date: null, body: cleanBody(strippedLines.join("\n").trim()) };
}

/**
 * Clean up the body text after date extraction:
 * - Remove trailing separators like " -", " --", " ——"
 */
function cleanBody(body: string): string {
  return body.replace(/\s*[-—–]+\s*$/, "").trim();
}

// Extract dates from all thoughts
let lastDate: string | null = null;
const processedThoughts: { date: string; body: string }[] = [];
const errors: string[] = [];

for (let t = 0; t < thoughts.length; t++) {
  const thought = thoughts[t];
  const { date, body } = extractDate(thought.lines);

  if (date) {
    lastDate = date;
    processedThoughts.push({ date, body });
  } else if (lastDate) {
    // Use previous thought's date
    console.warn(
      `Warning: No date found for thought #${t + 1}, using previous date ${lastDate}:`
    );
    console.warn(`  "${thought.lines[0]?.slice(0, 80)}..."`);
    processedThoughts.push({ date: lastDate, body });
  } else {
    errors.push(
      `Error: No date found for thought #${t + 1} and no previous date available:\n  "${thought.lines.join("\n  ")}"`
    );
  }
}

if (errors.length > 0) {
  console.error("\n=== ERRORS ===");
  for (const err of errors) {
    console.error(err);
  }
  Deno.exit(1);
}

// Group by date to handle naming
const dateCount: Record<string, number> = {};
const filesToWrite: { path: string; content: string }[] = [];

for (const thought of processedThoughts) {
  const { date, body } = thought;

  if (!dateCount[date]) {
    dateCount[date] = 0;
  }
  dateCount[date]++;
}

// Reset counts and assign filenames
const dateIndex: Record<string, number> = {};
for (const thought of processedThoughts) {
  const { date, body } = thought;

  if (!dateIndex[date]) {
    dateIndex[date] = 0;
  }
  dateIndex[date]++;

  let filename: string;
  if (dateCount[date] === 1) {
    filename = `${date}.md`;
  } else {
    filename = `${date}-${dateIndex[date]}.md`;
  }

  // Generate frontmatter
  // Use noon in +08:00 timezone as a reasonable default time
  const fileContent = `---
title: Untitled
date: ${date}T12:00:00+08:00
updated: ${date}
taxonomies:
  categories:
    - Thoughts
---

${body}
`;

  filesToWrite.push({
    path: `${OUTPUT_DIR}${filename}`,
    content: fileContent,
  });
}

// Write all files
await Deno.mkdir(OUTPUT_DIR, { recursive: true });

for (const file of filesToWrite) {
  await Deno.writeTextFile(file.path, file.content);
}

console.log(`\nDone! Generated ${filesToWrite.length} thought files in ${OUTPUT_DIR}`);

// Show summary by year
const yearCounts: Record<string, number> = {};
for (const file of filesToWrite) {
  const year = file.path.match(/(\d{4})-/)?.[1] || "unknown";
  yearCounts[year] = (yearCounts[year] || 0) + 1;
}
console.log("\nBy year:");
for (const [year, count] of Object.entries(yearCounts).sort()) {
  console.log(`  ${year}: ${count} thoughts`);
}
