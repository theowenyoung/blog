#!/usr/bin/env -S deno run --allow-read --allow-write --allow-run

/**
 * Split quotes.md into individual markdown files under content/blog/quotes/
 * Uses git blame to determine when each quote was added.
 * Extracts source_name and url from each quote's attribution.
 * Supports `## [thread] Section Title` to mark a section for Jant thread import.
 *
 * Modes:
 *   default               regenerate quote files from the source document
 *   --annotate-existing   update existing content/blog/quotes/*.md in place with
 *                         source + Jant thread metadata based on old/quotes.md
 */

import { parse as parseYaml } from "jsr:@std/yaml";

function resolveQuotesFile(): string {
  const candidates = [
    new URL("../old/quotes.md", import.meta.url).pathname,
    new URL("../content/quotes.md", import.meta.url).pathname,
  ];

  for (const file of candidates) {
    try {
      Deno.statSync(file);
      return file;
    } catch {
      // try next candidate
    }
  }

  throw new Error(
    `Could not find quotes source file. Checked: ${candidates.join(", ")}`,
  );
}

const QUOTES_FILE = resolveQuotesFile();
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
      /^\^?[0-9a-f]{40}\s+\d+\s+(\d+)/,
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
        isoDate: `${yyyy}-${mm}-${dd}T${hh}:${min}:${ss}${
          currentTz.slice(0, 3)
        }:${currentTz.slice(3)}`,
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
  sectionId: number;
  explicitThread: boolean;
  threadKey: string | null;
  threadOrder: number | null;
}

function parseSectionHeader(rawHeader: string): {
  title: string | null;
  isThread: boolean;
} {
  const trimmed = rawHeader.trim();
  const isThread = /^\[thread\]\s*/i.test(trimmed);
  const title = trimmed.replace(/^\[thread\]\s*/i, "").trim();
  return { title: title || null, isThread };
}

function threadKeyForSection(
  sectionHeader: string | null,
  sectionUrl: string | null,
): string | null {
  if (sectionUrl) return `url:${sectionUrl}`;
  if (sectionHeader) return `section:${sectionHeader}`;
  return null;
}

function compareFileNames(a: string, b: string): number {
  return a.localeCompare(b, undefined, { numeric: true });
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
  let currentSectionThread = false;
  let currentSectionId = 0;
  let currentBlock: string[] = [];
  let blockStartLine = 0;

  function flushCurrentBlock() {
    if (currentBlock.length === 0) return;

    quotes.push({
      rawLines: currentBlock,
      startLine: blockStartLine,
      sectionHeader: currentSection,
      sectionUrl: currentSectionUrl,
      sectionId: currentSectionId,
      explicitThread: currentSectionThread,
      threadKey: null,
      threadOrder: null,
    });
    currentBlock = [];
  }

  for (; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    const lineNum = i + 1; // 1-based

    // Skip <!-- more -->
    if (trimmed === "<!-- more -->") continue;

    // Section headers
    if (trimmed.startsWith("## ")) {
      flushCurrentBlock();
      const parsedSection = parseSectionHeader(trimmed.slice(3));
      currentSection = parsedSection.title;
      currentSectionUrl = null;
      currentSectionThread = parsedSection.isThread;
      currentSectionId++;
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
      flushCurrentBlock();
      const parsedSection = parseSectionHeader(trimmed);
      currentSection = parsedSection.title;
      currentSectionUrl = null;
      currentSectionThread = parsedSection.isThread;
      currentSectionId++;
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
          .map((
            l,
          ) => (l.startsWith("> ")
            ? l.slice(2)
            : l.startsWith(">")
            ? l.slice(1)
            : l)
          )
          .join("")
          .trim();
        const fromBlockMatch = blockContent.match(
          /^(?:来自|From):?\s*<?([^>]+)>?\s*$/,
        );
        if (fromBlockMatch) {
          currentSectionUrl = fromBlockMatch[1];
          currentBlock = [];
          continue;
        }
        flushCurrentBlock();
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
  flushCurrentBlock();

  assignThreadMetadata(quotes);
  return quotes;
}

function shouldTreatSectionAsThread(quotes: Quote[]): boolean {
  if (quotes.length === 0) return false;
  if (quotes.some((quote) => quote.explicitThread)) return true;

  const firstQuote = quotes[0];
  if (!firstQuote.sectionHeader && !firstQuote.sectionUrl) return false;

  return quotes.length > 1;
}

function assignThreadMetadata(quotes: Quote[]): void {
  const sections = new Map<number, Quote[]>();

  for (const quote of quotes) {
    const existing = sections.get(quote.sectionId);
    if (existing) {
      existing.push(quote);
      continue;
    }
    sections.set(quote.sectionId, [quote]);
  }

  for (const sectionQuotes of sections.values()) {
    if (!shouldTreatSectionAsThread(sectionQuotes)) continue;

    const firstQuote = sectionQuotes[0];
    const threadKey = threadKeyForSection(
      firstQuote.sectionHeader,
      firstQuote.sectionUrl,
    );
    if (!threadKey) continue;

    for (let i = 0; i < sectionQuotes.length; i++) {
      sectionQuotes[i].threadKey = threadKey;
      sectionQuotes[i].threadOrder = i + 1;
    }
  }
}

// ─── Step 3: Extract source info ────────────────────────────────────────────

interface SourceInfo {
  sourceName: string | null;
  url: string | null;
  body: string;
}

interface QuoteDateInfo {
  date: string;
  isoDate: string;
}

interface ExistingQuoteFile {
  path: string;
  frontmatter: string | null;
  body: string;
  extra: Record<string, unknown>;
  sourceName: string | null;
  sourceUrl: string | null;
  firstLine: string;
  normalizedBody: string;
}

interface ThreadSection {
  sectionId: number;
  header: string | null;
  url: string | null;
  threadKey: string;
  quotes: Quote[];
}

function extractSource(
  rawLines: string[],
  sectionHeader: string | null,
  sectionUrl: string | null,
): SourceInfo {
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
  const result = tryExtractSourceFromEnd(bodyLines, lastIdx, !sectionUrl);

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

function isLikelySourceString(str: string): boolean {
  const trimmed = str.trim();
  if (!trimmed) return false;
  if (trimmed.length > 80) return false;
  if (/[\n\r]/.test(trimmed)) return false;
  if (/^\[([^\]]*)\]\(([^)]+)\)\s*$/.test(trimmed)) return true;
  if (/[。！？；;]/.test(trimmed)) return false;
  return true;
}

function tryExtractSourceFromEnd(
  lines: string[],
  lastIdx: number,
  allowMultilineSource: boolean,
): ExtractResult | null {
  const lastLine = lines[lastIdx].trim();

  // Pattern 1: Standalone source line with separator
  // "—— Name", "-- Name", "- Name", "── Name"
  // Can include [source](url) or [Name](url) or 《Book》
  const separatorPattern = /^[-—–─―]+\s*(.+)$/;

  // Pattern 2: Source at end of content line with separator
  // "...content - Name", "...content -- Name"
  const inlineSeparatorPattern = /^(.+?)\s+[-—–─―]+\s+(.+)$/;

  // Check if last line is a standalone source line (starts with separator)
  const standaloneMatch = lastLine.match(separatorPattern);
  if (standaloneMatch) {
    const sourceStr = standaloneMatch[1].trim();
    if (!isLikelySourceString(sourceStr)) return null;
    const { name, url } = parseSourceString(sourceStr);
    const bodyLines = lines.slice(0, lastIdx);
    // Remove trailing empty lines
    while (
      bodyLines.length > 0 && bodyLines[bodyLines.length - 1].trim() === ""
    ) {
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
    if (!isLikelySourceString(sourceStr)) return null;
    const { name, url } = parseSourceString(sourceStr);
    const bodyLines = [...lines.slice(0, lastIdx), contentPart];
    const body = bodyLines.join("\n").trim();
    return { sourceName: name, url, body };
  }

  // Check second-to-last line (source might be on its own line after a blank-ish gap)
  // Check if last line is just a [source](url) or [Name](url)
  const linkOnlyMatch = lastLine.match(
    /^\[([^\]]*)\]\(([^)]+)\)\s*$/,
  );
  if (linkOnlyMatch) {
    const linkText = linkOnlyMatch[1];
    const linkUrl = linkOnlyMatch[2];
    const bodyLines = lines.slice(0, lastIdx);
    while (
      bodyLines.length > 0 && bodyLines[bodyLines.length - 1].trim() === ""
    ) {
      bodyLines.pop();
    }
    const body = cleanTrailingSeparator(bodyLines.join("\n").trim());
    const name = linkText.toLowerCase() === "source" ? null : linkText;
    return { sourceName: name, url: linkUrl, body };
  }

  if (allowMultilineSource && lastIdx >= 1) {
    const previousLine = lines[lastIdx - 1].trim();
    if (/[-—–─―]+\s*$/.test(previousLine)) {
      if (!isLikelySourceString(lastLine)) return null;
      const { name, url } = parseSourceString(lastLine);
      const bodyLines = [
        ...lines.slice(0, lastIdx - 1),
        cleanTrailingSeparator(previousLine),
      ];
      while (
        bodyLines.length > 0 && bodyLines[bodyLines.length - 1].trim() === ""
      ) {
        bodyLines.pop();
      }
      const body = bodyLines.join("\n").trim();
      if (body && (name || url)) {
        return { sourceName: name, url, body };
      }
    }
  }

  return null;
}

function parseSourceString(
  str: string,
): { name: string | null; url: string | null } {
  // Pattern: [source](url) or [Source](url)
  const sourceLinkMatch = str.match(
    /^\[([^\]]*)\]\(([^)]+)\)\s*$/,
  );
  if (sourceLinkMatch) {
    const text = sourceLinkMatch[1].trim();
    const url = sourceLinkMatch[2].trim();
    const name = text.toLowerCase() === "source" ? null : text;
    return { name, url };
  }

  // Pattern: Name [source](url) or Name ([source](url))
  const nameWithLinkMatch = str.match(
    /^(.+?)\s*\(?(\[([^\]]*)\]\(([^)]+)\))\)?\s*$/,
  );
  if (nameWithLinkMatch) {
    const namePart = nameWithLinkMatch[1].trim();
    const linkText = nameWithLinkMatch[3]?.trim();
    const linkUrl = nameWithLinkMatch[4]?.trim();
    // If link text is "source" or similar, name is the prefix part
    const name = namePart ||
      (linkText?.toLowerCase() === "source" ? null : linkText) || null;
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
  return body.replace(/\s*[-—–─―]+\s*$/, "").trim();
}

function stripQuotePrefix(line: string): string {
  if (line.startsWith("> ")) return line.slice(2);
  if (line.startsWith(">")) return line.slice(1);
  return line;
}

function normalizeInlineWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeBodyForMatch(body: string): string {
  return body
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => normalizeInlineWhitespace(line))
    .filter(Boolean)
    .join("\n");
}

function firstContentLineFromRawLines(rawLines: string[]): string {
  for (const rawLine of rawLines) {
    const stripped = normalizeInlineWhitespace(
      cleanTrailingSeparator(stripQuotePrefix(rawLine)),
    );
    if (stripped) return stripped;
  }
  return "";
}

function quoteBodyFromRawLines(rawLines: string[]): string {
  return rawLines.map(stripQuotePrefix).join("\n").trim();
}

function quoteLookupKey(body: string, url: string | null): string {
  return JSON.stringify({
    body: body.trim(),
    url: url?.trim() ?? "",
  });
}

async function loadExistingQuoteDates(): Promise<Map<string, QuoteDateInfo>> {
  const result = new Map<string, QuoteDateInfo>();

  try {
    const files: string[] = [];
    for await (const entry of Deno.readDir(OUTPUT_DIR)) {
      if (entry.isFile && entry.name.endsWith(".md")) {
        files.push(entry.name);
      }
    }

    for (const file of files.sort(compareFileNames)) {
      const content = await Deno.readTextFile(`${OUTPUT_DIR}${file}`);
      const match = content.match(
        /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/,
      );
      if (!match) continue;

      const frontmatter = match[1];
      const body = match[2].trim();
      const date = frontmatter.match(/^updated:\s*(.+)$/m)?.[1]?.trim();
      const isoDate = frontmatter.match(/^date:\s*(.+)$/m)?.[1]?.trim();
      const url = frontmatter.match(/^\s+url:\s*["']?([^"'\n]+)["']?\s*$/m)?.[1]
        ?.trim() ??
        null;

      if (!body || !date || !isoDate) continue;
      result.set(quoteLookupKey(body, url), { date, isoDate });
    }
  } catch {
    // Ignore when the output directory does not exist yet.
  }

  return result;
}

function parseFrontmatterDocument(content: string): {
  frontmatter: string | null;
  meta: Record<string, unknown>;
  body: string;
} {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { frontmatter: null, meta: {}, body: content.trim() };
  let meta: Record<string, unknown> = {};
  try {
    meta = (parseYaml(match[1]) as Record<string, unknown>) ?? {};
  } catch {
    // ignore malformed frontmatter
  }
  return { frontmatter: match[1], meta, body: match[2].trim() };
}

function formatExtraScalar(value: unknown): string {
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return JSON.stringify(String(value));
}

function renderExtraBlock(extra: Record<string, unknown>): string | null {
  const orderedKeys = [
    "source_name",
    "url",
    "jant_thread_key",
    "jant_thread_order",
  ];

  const entries = orderedKeys
    .filter((key) => key in extra)
    .map((key) => [key, extra[key]] as const)
    .filter(([, value]) => value != null && value !== "");

  for (const [key, value] of Object.entries(extra)) {
    if (orderedKeys.includes(key) || value == null || value === "") continue;
    entries.push([key, value]);
  }

  if (entries.length === 0) return null;

  const lines = ["extra:"];
  for (const [key, value] of entries) {
    lines.push(`  ${key}: ${formatExtraScalar(value)}`);
  }
  return lines.join("\n");
}

function updateFrontmatterExtra(
  frontmatter: string | null,
  extra: Record<string, unknown>,
): string | null {
  const extraBlock = renderExtraBlock(extra);
  if (!frontmatter) return extraBlock;

  const lines = frontmatter.split(/\r?\n/);
  const start = lines.findIndex((line) => /^extra:\s*$/.test(line));
  const replacement = extraBlock ? extraBlock.split("\n") : [];

  if (start === -1) {
    return [...lines, ...replacement].join("\n").trimEnd();
  }

  let end = start + 1;
  while (
    end < lines.length &&
    (lines[end].startsWith(" ") || lines[end].startsWith("\t") ||
      lines[end].trim() === "")
  ) {
    end++;
  }

  return [...lines.slice(0, start), ...replacement, ...lines.slice(end)].join(
    "\n",
  ).trimEnd();
}

function buildDocument(frontmatter: string | null, body: string): string {
  const trimmedBody = body.trim();
  if (!frontmatter) {
    return `${trimmedBody}\n`;
  }
  return `---\n${frontmatter}\n---\n\n${trimmedBody}\n`;
}

async function loadExistingQuoteFiles(): Promise<ExistingQuoteFile[]> {
  const files: ExistingQuoteFile[] = [];
  const names: string[] = [];

  for await (const entry of Deno.readDir(OUTPUT_DIR)) {
    if (entry.isFile && entry.name.endsWith(".md")) {
      names.push(entry.name);
    }
  }

  for (const name of names.sort(compareFileNames)) {
    const path = `${OUTPUT_DIR}${name}`;
    const content = await Deno.readTextFile(path);
    const { frontmatter, meta, body } = parseFrontmatterDocument(content);
    const extra = typeof meta.extra === "object" && meta.extra
      ? (meta.extra as Record<string, unknown>)
      : {};
    const sourceName = typeof extra.source_name === "string"
      ? extra.source_name
      : null;
    const sourceUrl = typeof extra.url === "string" ? extra.url : null;
    const normalizedBody = normalizeBodyForMatch(body);
    const firstLine = normalizeInlineWhitespace(
      normalizedBody.split("\n")[0] ?? "",
    );

    files.push({
      path,
      frontmatter,
      body,
      extra,
      sourceName,
      sourceUrl,
      firstLine,
      normalizedBody,
    });
  }

  return files;
}

function quoteBlockMatchesFile(quote: Quote, file: ExistingQuoteFile): boolean {
  const { body } = extractSource(
    quote.rawLines,
    quote.sectionHeader,
    quote.sectionUrl,
  );
  const normalizedQuoteBody = normalizeBodyForMatch(body);
  const extractedFirstLine = normalizeInlineWhitespace(
    cleanTrailingSeparator(normalizedQuoteBody.split("\n")[0] ?? ""),
  );
  const rawFirstLine = firstContentLineFromRawLines(quote.rawLines);
  const firstLineCandidates = [extractedFirstLine, rawFirstLine].filter(
    Boolean,
  );

  if (firstLineCandidates.length === 0) return false;

  return firstLineCandidates.includes(file.firstLine) ||
    file.normalizedBody === normalizedQuoteBody ||
    firstLineCandidates.some((candidate) =>
      file.normalizedBody.startsWith(candidate)
    );
}

function sourceMatchesSection(
  file: ExistingQuoteFile,
  section: ThreadSection,
): boolean {
  const existingThreadKey = typeof file.extra.jant_thread_key === "string"
    ? file.extra.jant_thread_key
    : null;

  if (existingThreadKey && existingThreadKey === section.threadKey) {
    return true;
  }

  if (section.url && file.sourceUrl === section.url) {
    return true;
  }

  if (section.header && file.sourceName === section.header) {
    return true;
  }

  return false;
}

function collectThreadSections(quotes: Quote[]): ThreadSection[] {
  const sections = new Map<number, ThreadSection>();

  for (const quote of quotes) {
    if (!quote.threadKey) continue;

    const existing = sections.get(quote.sectionId);
    if (existing) {
      existing.quotes.push(quote);
      continue;
    }

    sections.set(quote.sectionId, {
      sectionId: quote.sectionId,
      header: quote.sectionHeader,
      url: quote.sectionUrl,
      threadKey: quote.threadKey,
      quotes: [quote],
    });
  }

  return [...sections.values()].sort((a, b) => a.sectionId - b.sectionId);
}

function alignQuotesToFiles(
  quotes: Quote[],
  files: ExistingQuoteFile[],
): ExistingQuoteFile[] | null {
  const matched: ExistingQuoteFile[] = [];
  let fileIndex = 0;

  for (const quote of quotes) {
    let matchedIndex = -1;

    for (let i = fileIndex; i < files.length; i++) {
      if (!quoteBlockMatchesFile(quote, files[i])) continue;
      matchedIndex = i;
      break;
    }

    if (matchedIndex === -1) return null;
    matched.push(files[matchedIndex]);
    fileIndex = matchedIndex + 1;
  }

  return matched;
}

function findMatchingThreadFiles(
  section: ThreadSection,
  candidates: ExistingQuoteFile[],
): ExistingQuoteFile[] | null {
  const sourceCandidates = candidates.filter((file) =>
    sourceMatchesSection(file, section)
  );
  const sourceMatch = alignQuotesToFiles(section.quotes, sourceCandidates);
  if (sourceMatch) return sourceMatch;

  const bodyCandidates = candidates.filter((file) =>
    section.quotes.some((quote) => quoteBlockMatchesFile(quote, file))
  );
  return alignQuotesToFiles(section.quotes, bodyCandidates);
}

function selectThreadFiles(
  section: ThreadSection,
  files: ExistingQuoteFile[],
  usedPaths: Set<string>,
): ExistingQuoteFile[] | null {
  const available = files.filter((file) => !usedPaths.has(file.path));
  const match = findMatchingThreadFiles(section, available);
  if (!match) return null;

  for (const file of match) {
    usedPaths.add(file.path);
  }

  return match;
}

async function annotateExistingThreadMetadata(quotes: Quote[]): Promise<void> {
  const files = await loadExistingQuoteFiles();
  const sections = collectThreadSections(quotes);
  const warnings: string[] = [];
  let updated = 0;
  let cursor = 0;
  const usedPaths = new Set<string>();

  for (const section of sections) {
    const matchedFiles = selectThreadFiles(
      section,
      files.slice(cursor),
      usedPaths,
    );

    if (!matchedFiles || matchedFiles.length !== section.quotes.length) {
      warnings.push(
        `Could not map thread section "${
          section.header ?? section.url ?? section.threadKey
        }" to existing quote files.`,
      );
      continue;
    }

    for (let i = 0; i < section.quotes.length; i++) {
      const quote = section.quotes[i];
      const file = matchedFiles[i];
      const { sourceName, url } = extractSource(
        quote.rawLines,
        quote.sectionHeader,
        quote.sectionUrl,
      );
      const extra = { ...file.extra };

      if (sourceName) extra.source_name = sourceName;
      else delete extra.source_name;

      if (url) extra.url = url;
      else delete extra.url;

      extra.jant_thread_key = quote.threadKey;
      extra.jant_thread_order = quote.threadOrder;

      const nextContent = buildDocument(
        updateFrontmatterExtra(file.frontmatter, extra),
        file.body,
      );
      const currentContent = await Deno.readTextFile(file.path);
      if (currentContent !== nextContent) {
        await Deno.writeTextFile(file.path, nextContent);
        updated++;
      }
    }

    const lastMatched = matchedFiles[matchedFiles.length - 1];
    const lastIndex = files.findIndex((file) => file.path === lastMatched.path);
    if (lastIndex !== -1) cursor = lastIndex + 1;
  }

  console.log(`Updated ${updated} existing quote files.`);
  if (warnings.length > 0) {
    console.log("\nWarnings:");
    for (const warning of warnings) {
      console.log(`  - ${warning}`);
    }
  }
}

// ─── Step 4: Generate files ─────────────────────────────────────────────────

async function main() {
  console.log(`Parsing ${QUOTES_FILE}...`);
  const content = await Deno.readTextFile(QUOTES_FILE);
  const quotes = parseQuotesFile(content);
  console.log(`Found ${quotes.length} quote blocks`);

  if (Deno.args.includes("--annotate-existing")) {
    await annotateExistingThreadMetadata(quotes);
    return;
  }

  console.log("Running git blame...");
  const blameData = await getBlameData();
  const existingQuoteDates = await loadExistingQuoteDates();

  // Process each quote
  interface ProcessedQuote {
    date: string;
    isoDate: string;
    sourceName: string | null;
    url: string | null;
    body: string;
    threadKey: string | null;
    threadOrder: number | null;
  }

  const processed: ProcessedQuote[] = [];
  const errors: string[] = [];

  for (let i = 0; i < quotes.length; i++) {
    const q = quotes[i];

    const { sourceName, url, body } = extractSource(
      q.rawLines,
      q.sectionHeader,
      q.sectionUrl,
    );

    if (!body.trim()) {
      continue; // Skip empty quotes
    }

    const dateInfo = blameData.get(q.startLine) ??
      existingQuoteDates.get(quoteLookupKey(body, url));
    if (!dateInfo) {
      errors.push(
        `Error: No date metadata for quote #${i + 1} at line ${q.startLine}: "${
          q.rawLines[0]?.slice(0, 60)
        }..."`,
      );
      continue;
    }

    processed.push({
      date: dateInfo.date,
      isoDate: dateInfo.isoDate,
      sourceName: sourceName,
      url: url,
      body: body.trim(),
      threadKey: q.threadKey,
      threadOrder: q.threadOrder,
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

    if (q.sourceName || q.url || q.threadKey || q.threadOrder != null) {
      frontmatter += `\nextra:`;
      if (q.sourceName) {
        // Escape quotes in YAML
        const escaped = q.sourceName.replace(/"/g, '\\"');
        frontmatter += `\n  source_name: "${escaped}"`;
      }
      if (q.url) {
        frontmatter += `\n  url: "${q.url}"`;
      }
      if (q.threadKey) {
        const escaped = q.threadKey.replace(/"/g, '\\"');
        frontmatter += `\n  jant_thread_key: "${escaped}"`;
      }
      if (q.threadOrder != null) {
        frontmatter += `\n  jant_thread_order: ${q.threadOrder}`;
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
