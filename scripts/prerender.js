import "dotenv/config";
import express from "express";
import puppeteer from "puppeteer";
import { createClient } from "@supabase/supabase-js";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, "..");
const staticRoutes = ["/", "/about", "/services", "/jobs", "/blog", "/contact"];
const buildTimeoutMs = 60000;

function getSupabaseCredentials() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    "";

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Supabase credentials are required for prerendering. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY or a publishable/anon key.",
    );
  }

  return { supabaseUrl, supabaseKey };
}

function createSupabaseClient() {
  const { supabaseUrl, supabaseKey } = getSupabaseCredentials();
  return createClient(supabaseUrl, supabaseKey);
}

async function fetchDynamicRoutes() {
  const supabase = createSupabaseClient();

  const [{ data: jobOffers, error: jobsError }, { data: blogPosts, error: postsError }] =
    await Promise.all([
      supabase
        .from("job_offers")
        .select("slug")
        .eq("status", "published")
        .order("publish_at", { ascending: false }),
      supabase
        .from("blog_posts")
        .select("slug")
        .eq("status", "published")
        .order("publish_at", { ascending: false }),
    ]);

  if (jobsError) {
    throw new Error(`Supabase job_offers query failed: ${jobsError.message}`);
  }
  if (postsError) {
    throw new Error(`Supabase blog_posts query failed: ${postsError.message}`);
  }

  const jobRoutes = Array.isArray(jobOffers)
    ? jobOffers
        .map((job) => (typeof job.slug === "string" ? `/jobs/${job.slug}` : undefined))
        .filter(Boolean)
    : [];
  const postRoutes = Array.isArray(blogPosts)
    ? blogPosts
        .map((post) => (typeof post.slug === "string" ? `/blog/${post.slug}` : undefined))
        .filter(Boolean)
    : [];

  return [...jobRoutes, ...postRoutes];
}

function createServer(outputDir) {
  const app = express();
  app.use(express.static(outputDir));
  app.get("*", (_req, res) => res.sendFile(join(outputDir, "index.html")));

  return new Promise((resolve, reject) => {
    const server = app.listen(0, () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        reject(new Error("Failed to start prerender server."));
        return;
      }
      resolve({ server, port: address.port });
    });
    server.on("error", reject);
  });
}

function getLocalBrowserExecutable() {
  const explicitPath = process.env.PUPPETEER_EXECUTABLE_PATH;
  if (explicitPath && existsSync(explicitPath)) {
    return explicitPath;
  }

  try {
    const executable = puppeteer.executablePath();
    if (typeof executable === "string" && executable.length > 0 && existsSync(executable)) {
      return executable;
    }
  } catch (error) {
    // ignore if Puppeteer did not download a browser yet
  }

  const candidates = [
    // Windows
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
    "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    // Linux
    "/usr/bin/google-chrome-stable",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium-browser",
    "/usr/bin/chromium",
    "/usr/bin/msedge",
    "/usr/bin/brave-browser",
  ];

  for (const path of candidates) {
    if (existsSync(path)) {
      return path;
    }
  }

  return undefined;
}

function buildStaticHtml(route, baseHtml) {
  const title = route === "/"
    ? "EmploiPlus Group"
    : route.startsWith("/jobs/")
      ? `Offre d'emploi | EmploiPlus Group`
      : route.startsWith("/blog/")
        ? `Article de blog | EmploiPlus Group`
        : "EmploiPlus Group";

  const canonical = `https://emploiplus-group.com${route}`;
  const description = "Trouvez votre prochain emploi ou stage en République du Congo. Découvrez les meilleures opportunités de recrutement à Brazzaville et Pointe-Noire sur Emploi+.";

  return baseHtml
    .replace(/<title>.*?<\/title>/s, `<title>${title}</title>`)
    .replace(/<meta name="description" content=".*?"/s, `<meta name="description" content="${description}"`)
    .replace(/<meta name="robots" content=".*?"/s, '<meta name="robots" content="index,follow"')
    .replace(/<link rel="canonical" href=".*?"/s, `<link rel="canonical" href="${canonical}" />`);
}

async function renderRoute(page, baseUrl, route, outputDir, baseHtml, useBrowser) {
  const targetPath = join(outputDir, route === "/" ? "index.html" : `${route.replace(/^\//, "")}/index.html`);
  mkdirSync(dirname(targetPath), { recursive: true });

  if (!useBrowser || !page) {
    const html = buildStaticHtml(route, baseHtml);
    writeFileSync(targetPath, html, "utf8");
    console.log(`Prerendered ${route} -> ${targetPath} (static fallback)`);
    return;
  }

  const url = `${baseUrl}${route}`;
  await page.goto(url, { waitUntil: "networkidle2", timeout: buildTimeoutMs });

  await page.waitForFunction(
    () => document.readyState === "complete" && document.querySelector("#root") !== null,
    { timeout: buildTimeoutMs },
  );

  const html = await page.content();
  writeFileSync(targetPath, html, "utf8");

  console.log(`Prerendered ${route} -> ${targetPath}`);
}

export async function prerenderRoutes({ outputDir = "dist", routes = undefined } = {}) {
  const resolvedOutputDir = resolve(rootDir, outputDir);
  if (!existsSync(resolvedOutputDir)) {
    throw new Error(`Vite build output not found at ${resolvedOutputDir}. Run vite build first.`);
  }

  const dynamicRoutes = await fetchDynamicRoutes();
  const routeList = Array.from(new Set([...(routes ?? staticRoutes), ...dynamicRoutes]));
  const baseHtml = readFileSync(join(resolvedOutputDir, "index.html"), "utf8");

  const { server, port } = await createServer(resolvedOutputDir);
  const executablePath = getLocalBrowserExecutable();
  let browser;
  let page;
  let useBrowser = false;

  if (executablePath) {
    try {
      const launchOptions = {
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
        executablePath,
      };
      browser = await puppeteer.launch(launchOptions);
      page = await browser.newPage();
      useBrowser = true;
    } catch (error) {
      console.warn(`Puppeteer browser unavailable (${error.message}). Falling back to static HTML.`);
    }
  } else {
    console.warn("No browser executable found for Puppeteer. Falling back to static HTML.");
  }

  try {
    const baseUrl = `http://127.0.0.1:${port}`;

    for (const route of routeList) {
      await renderRoute(page, baseUrl, route, resolvedOutputDir, baseHtml, useBrowser);
    }
  } finally {
    if (browser) {
      await browser.close();
    }
    server.close();
  }
}

if (process.argv[1] && process.argv[1].endsWith("prerender.js")) {
  const outputDir = process.argv[2] || "dist";
  const extraRoutes = process.argv.slice(3);
  await prerenderRoutes({ outputDir, routes: extraRoutes.length > 0 ? [...staticRoutes, ...extraRoutes] : undefined });
}
