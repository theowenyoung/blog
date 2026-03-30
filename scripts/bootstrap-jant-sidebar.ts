#!/usr/bin/env -S deno run --allow-read --allow-net --allow-env --allow-write --unsafely-ignore-certificate-errors

/**
 * Sync Jant collections, dividers, and sidebar links without migrating posts.
 *
 * Usage:
 *   deno run --allow-all --unsafely-ignore-certificate-errors scripts/bootstrap-jant-sidebar.ts
 *   deno run --allow-all --unsafely-ignore-certificate-errors scripts/bootstrap-jant-sidebar.ts --dry-run
 */

import "jsr:@std/dotenv/load";
import { bootstrapCollections } from "./migrate-to-jant.ts";

const JANT_BASE_URL = Deno.env.get("JANT_BASE_URL") ??
  "https://jant.localtest.me";
const flagDryRun = Deno.args.includes("--dry-run");

console.log("🚀  Jant Sidebar Bootstrap");
console.log(`    URL    : ${JANT_BASE_URL}`);
if (flagDryRun) console.log("    Mode   : DRY RUN (no writes)");
console.log();

bootstrapCollections().catch((e) => {
  console.error("Fatal:", e);
  Deno.exit(1);
});
