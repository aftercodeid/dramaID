import { readFile, readdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const distDir = join(here, "..", "dist");

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    else if (entry.name.endsWith(".html")) files.push(full);
  }
  return files;
}

function existsAsRoute(href) {
  // Internal links only; ignore external/mailto/anchor links.
  if (!href.startsWith("/")) return true;
  const clean = href.split("#")[0].split("?")[0];
  const candidates = [
    join(distDir, clean, "index.html"),
    join(distDir, `${clean}.html`),
  ];
  return candidates;
}

const htmlFiles = await walk(distDir);
const broken = [];

for (const file of htmlFiles) {
  const html = await readFile(file, "utf8");
  const hrefMatches = html.matchAll(/<a\s[^>]*href="([^"]+)"/g);
  for (const [, href] of hrefMatches) {
    if (!href.startsWith("/")) continue; // external/mailto/anchor
    const candidates = existsAsRoute(href);
    const { existsSync } = await import("node:fs");
    const found = candidates.some((c) => existsSync(c));
    if (!found) broken.push({ file: file.replace(distDir, "dist"), href });
  }
}

if (broken.length > 0) {
  console.error(`Found ${broken.length} broken internal link(s):`);
  for (const { file, href } of broken) {
    console.error(`  ${file} -> ${href}`);
  }
  process.exit(1);
}

console.log(`All internal links OK (${htmlFiles.length} pages checked).`);
