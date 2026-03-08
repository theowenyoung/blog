#!/usr/bin/env -S deno run --allow-read --allow-write

/**
 * Split journal files into individual link markdown files under content/blog/links/
 * Each top-level link in a journal becomes a separate file.
 *
 * Input:  content/blog/journals/*.md
 * Output: content/blog/links/YYYY-MM-DD-N.md (one per link)
 */

const JOURNALS_DIR = new URL(
  "../content/blog/journals/",
  import.meta.url
).pathname;
const OUTPUT_DIR = new URL("../content/blog/links/", import.meta.url).pathname;

// ─── Types ───────────────────────────────────────────────────────────────────

interface LinkEntry {
  title: string;
  url: string;
  body: string;
  date: string; // ISO datetime from journal front matter
  updated: string; // YYYY-MM-DD from journal front matter
  isEnglish: boolean;
}

// ─── Front matter parsing ────────────────────────────────────────────────────

function parseFrontMatter(content: string): {
  date: string;
  updated: string;
  body: string;
} {
  const lines = content.split("\n");
  let i = 0;
  if (lines[0]?.trim() !== "---") {
    throw new Error("No front matter found");
  }
  i = 1;
  let date = "";
  let updated = "";
  while (i < lines.length && lines[i]?.trim() !== "---") {
    const line = lines[i];
    const dateMatch = line.match(/^date:\s*(.+)$/);
    if (dateMatch) date = dateMatch[1].trim().replace(/^["']|["']$/g, "");
    const updatedMatch = line.match(/^updated:\s*(.+)$/);
    if (updatedMatch)
      updated = updatedMatch[1].trim().replace(/^["']|["']$/g, "");
    i++;
  }
  i++; // skip closing ---
  return { date, updated, body: lines.slice(i).join("\n") };
}

// ─── Markdown link parsing (handles balanced parentheses in URLs) ────────────

function parseMarkdownLink(
  text: string
): { title: string; url: string; rest: string } | null {
  const bracketStart = text.indexOf("[");
  if (bracketStart === -1) return null;

  // Find matching ] with balanced brackets
  let depth = 0;
  let bracketEnd = -1;
  for (let i = bracketStart; i < text.length; i++) {
    if (text[i] === "[") depth++;
    else if (text[i] === "]") {
      depth--;
      if (depth === 0) {
        bracketEnd = i;
        break;
      }
    }
  }
  if (bracketEnd === -1 || text[bracketEnd + 1] !== "(") return null;

  // Find matching ) with balanced parentheses
  depth = 0;
  let parenEnd = -1;
  for (let i = bracketEnd + 1; i < text.length; i++) {
    if (text[i] === "(") depth++;
    else if (text[i] === ")") {
      depth--;
      if (depth === 0) {
        parenEnd = i;
        break;
      }
    }
  }
  if (parenEnd === -1) return null;

  return {
    title: text.slice(bracketStart + 1, bracketEnd),
    url: text.slice(bracketEnd + 2, parenEnd),
    rest: text.slice(parenEnd + 1),
  };
}

// ─── Link extraction from journal body ───────────────────────────────────────

function extractLinks(
  body: string,
  date: string,
  updated: string,
  isEnglish: boolean
): LinkEntry[] {
  const lines = body.split("\n");
  const entries: LinkEntry[] = [];

  let currentTitle = "";
  let currentUrl = "";
  let bodyParts: string[] = [];
  let inEntry = false;

  function flushEntry() {
    if (inEntry && currentUrl) {
      const body = bodyParts.join("\n").trim();
      entries.push({
        title: currentTitle,
        url: currentUrl,
        body,
        date,
        updated,
        isEnglish,
      });
    }
    inEntry = false;
    currentTitle = "";
    currentUrl = "";
    bodyParts = [];
  }

  for (const line of lines) {
    const trimmed = line.trim();

    // Top-level link item: - [Title](URL)...
    if (trimmed.startsWith("- [") && !line.startsWith("  ")) {
      const parsed = parseMarkdownLink(trimmed.slice(2)); // skip "- "
      if (parsed) {
        flushEntry();
        inEntry = true;
        currentTitle = parsed.title;
        currentUrl = parsed.url;

        const rest = parsed.rest.trim();
        if (rest.startsWith("- ")) {
          // Inline comment separator: "- comment text"
          bodyParts.push(rest.slice(2));
        } else if (rest === "-") {
          // Comment continues on next line, don't add anything yet
        } else if (rest) {
          // Other text after URL (e.g., translation links)
          bodyParts.push(rest);
        }
        continue;
      }
    }

    // Top-level blockquote - not a link entry, skip
    if (trimmed.startsWith(">") && !line.startsWith("  ")) {
      flushEntry();
      continue;
    }

    // Indented line - continuation of current entry
    if (line.startsWith("  ") && inEntry) {
      bodyParts.push(line.slice(2)); // de-indent by 2 spaces
      continue;
    }

    // Empty line
    if (trimmed === "") {
      if (inEntry) {
        bodyParts.push("");
      }
      continue;
    }

    // Any other top-level non-link content ends the current entry
    if (!line.startsWith("  ")) {
      flushEntry();
    }
  }

  flushEntry();
  return entries;
}

// ─── YAML helpers ────────────────────────────────────────────────────────────

function yamlEscapeTitle(str: string): string {
  const escaped = str.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  return `"${escaped}"`;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const allEntries: LinkEntry[] = [];

  for await (const entry of Deno.readDir(JOURNALS_DIR)) {
    if (!entry.isFile || entry.name.startsWith("_index") || !entry.name.endsWith(".md")) {
      continue;
    }

    const isEnglish = entry.name.endsWith(".en.md");
    const content = await Deno.readTextFile(JOURNALS_DIR + entry.name);

    try {
      const { date, updated, body } = parseFrontMatter(content);
      const links = extractLinks(body, date, updated, isEnglish);
      allEntries.push(...links);
    } catch (e) {
      console.error(`Error processing ${entry.name}: ${(e as Error).message}`);
    }
  }

  // Sort by date for consistent ordering
  allEntries.sort((a, b) => a.date.localeCompare(b.date));

  // Write files
  await Deno.mkdir(OUTPUT_DIR, { recursive: true });
  const dateIndex: Record<string, number> = {};
  let written = 0;

  for (const e of allEntries) {
    const key = e.updated + (e.isEnglish ? ".en" : "");
    dateIndex[key] = (dateIndex[key] || 0) + 1;

    const suffix = e.isEnglish ? ".en.md" : ".md";
    const filename = `${e.updated}-${dateIndex[key]}${suffix}`;

    let fm = `---\ntitle: ${yamlEscapeTitle(e.title)}`;
    fm += `\ndate: ${e.date}`;
    fm += `\nupdated: ${e.updated}`;
    fm += `\ntaxonomies:\n  categories:\n    - Links`;
    fm += `\nextra:\n  url: ${e.url}`;
    fm += `\n---`;

    let fileContent = fm + "\n";
    if (e.body) {
      fileContent += "\n" + e.body + "\n";
    }

    await Deno.writeTextFile(OUTPUT_DIR + filename, fileContent);
    written++;
  }

  console.log(`\nDone! Generated ${written} link files in ${OUTPUT_DIR}`);

  // Summary by year
  const yearCounts: Record<string, number> = {};
  for (const e of allEntries) {
    const year = e.updated.slice(0, 4);
    yearCounts[year] = (yearCounts[year] || 0) + 1;
  }
  console.log("\nBy year:");
  for (const [year, count] of Object.entries(yearCounts).sort()) {
    console.log(`  ${year}: ${count} links`);
  }
}

main();
