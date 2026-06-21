import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = new URL("../", import.meta.url).pathname;
const distSitemap = new URL("../dist/sitemap.xml", import.meta.url).pathname;
const publicDir = new URL("../public", import.meta.url).pathname;
const publicSitemap = new URL("../public/sitemap.xml", import.meta.url).pathname;

if (!existsSync(distSitemap)) {
  console.warn(`No sitemap found at ${distSitemap}. Please run the build first.`);
  process.exit(0);
}

if (!existsSync(publicDir)) {
  mkdirSync(publicDir, { recursive: true });
}

copyFileSync(distSitemap, publicSitemap);
console.log(`Copied sitemap.xml to ${publicSitemap}`);
