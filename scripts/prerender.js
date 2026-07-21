import "dotenv/config";
import express from "express";
import puppeteer from "puppeteer";
import { createClient } from "@supabase/supabase-js";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
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
  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    return process.env.PUPPETEER_EXECUTABLE_PATH;
  }

  try {
    const executable = puppeteer.executablePath();
    if (typeof executable === "string" && executable.length > 0) {
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

async function renderRoute(page, baseUrl, route, outputDir) {
  const url = `${baseUrl}${route}`;
  await page.goto(url, { waitUntil: "networkidle2", timeout: buildTimeoutMs });

  await page.waitForFunction(
    () => document.readyState === "complete" && document.querySelector("#root") !== null,
    { timeout: buildTimeoutMs },
  );

  const html = await page.content();
  const targetPath = join(outputDir, route === "/" ? "index.html" : `${route.replace(/^\//, "")}/index.html`);
  mkdirSync(dirname(targetPath), { recursive: true });
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

  const { server, port } = await createServer(resolvedOutputDir);
  const executablePath = getLocalBrowserExecutable();
  const launchOptions = {
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    ...(executablePath ? { executablePath } : {}),
  };
  const browser = await puppeteer.launch(launchOptions);

  try {
    const page = await browser.newPage();
    const baseUrl = `http://127.0.0.1:${port}`;

    for (const route of routeList) {
      await renderRoute(page, baseUrl, route, resolvedOutputDir);
    }
  } finally {
    await browser.close();
    server.close();
  }
}

if (process.argv[1] && process.argv[1].endsWith("prerender.js")) {
  const outputDir = process.argv[2] || "dist";
  const extraRoutes = process.argv.slice(3);
  await prerenderRoutes({ outputDir, routes: extraRoutes.length > 0 ? [...staticRoutes, ...extraRoutes] : undefined });
}
