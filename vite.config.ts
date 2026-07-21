import { defineConfig, loadEnv, type ViteDevServer } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { writeFileSync, mkdirSync, copyFileSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";
import { pathToFileURL } from "node:url";
import type { ResolvedConfig } from "vite";

function devApiHandlerPlugin() {
  return {
    name: "dev-api-handler",
    configureServer(server: ViteDevServer) {
      server.middlewares.use(async (req: any, res: any, next: () => void) => {
        if (!req.url?.startsWith("/api/")) {
          return next();
        }

        const parsedUrl = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
        const pathname = parsedUrl.pathname.replace(/^\/api\/?/, "").trim();
        if (!pathname) {
          return next();
        }

        const routeFile = resolve(process.cwd(), `api/${pathname}.ts`);
        if (!existsSync(routeFile)) {
          return next();
        }

        const chunks: Buffer[] = [];
        req.on("data", (chunk: Buffer | string) => {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        });

        req.on("end", async () => {
          const bodyText = Buffer.concat(chunks).toString("utf8");

          const request = {
            method: req.method,
            headers: req.headers,
            url: req.url,
            query: parsedUrl.searchParams,
            body: bodyText,
            async *[Symbol.asyncIterator]() {
              if (bodyText) {
                yield Buffer.from(bodyText);
              }
            },
          };

          const response = {
            statusCode: 200,
            headers: {} as Record<string, string>,
            setHeader(name: string, value: string) {
              this.headers[name] = String(value);
            },
            getHeader(name: string) {
              return this.headers[name];
            },
            status(code: number) {
              this.statusCode = code;
              return this;
            },
            json(payload: unknown) {
              this.setHeader("Content-Type", "application/json; charset=utf-8");
              this.end(JSON.stringify(payload));
              return this;
            },
            end(payload?: string | Buffer) {
              const body = typeof payload === "string" ? payload : payload?.toString() || "";
              res.writeHead(this.statusCode, this.headers);
              res.end(body);
            },
          };

          try {
            const handlerModule = await server.ssrLoadModule(routeFile);
            await handlerModule.default(request, response);
          } catch (error) {
            console.error(`Dev API handler failed for /api/${pathname}`, error);
            response.status(500).json({
              error: "Dev API handler failed",
              details: error instanceof Error ? error.message : String(error),
            });
          }
        });
      });
    },
  };
}

function sitemapGeneratorPlugin(env: Record<string, string>) {
  let outputDir = "dist";
  let rootDir = process.cwd();

  return {
    name: "custom-sitemap-generator",

    configResolved(config: ResolvedConfig) {
      outputDir = config.build.outDir || "dist";
      rootDir = config.root || process.cwd();

      if (!resolve(outputDir).startsWith("/") && !outputDir.includes(":")) {
        outputDir = resolve(rootDir, outputDir);
      }
    },

    async closeBundle() {
      const hostname = "https://emploiplus-group.com".replace(/\/$/, "");

      const staticRoutes = ["/", "/about", "/services", "/jobs", "/blog", "/contact"];

      const now = new Date().toISOString();

      const publishRoute = (
        route: string,
        lastmod = now,
        changefreq = "weekly",
        priority = "0.7",
      ) =>
        `  <url>\n    <loc>${hostname}${route}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;

      const pageItems = staticRoutes
        .map((route) => publishRoute(route, now, "daily", "0.9"))
        .join("\n");

      const sitemapItems: string[] = [pageItems];

      try {
        const { createClient } = await import("@supabase/supabase-js");

        const supabaseUrl = env.VITE_SUPABASE_URL || env.SUPABASE_URL || "";

        const supabaseKey =
          env.VITE_SUPABASE_ANON_KEY ||
          env.SUPABASE_ANON_KEY ||
          env.VITE_SUPABASE_PUBLISHABLE_KEY ||
          env.SUPABASE_PUBLISHABLE_KEY ||
          env.SUPABASE_SERVICE_ROLE_KEY ||
          "";

        if (supabaseUrl && supabaseKey) {
          const supabase = createClient(supabaseUrl, supabaseKey);

          const { data: jobs } = await supabase
            .from("job_offers")
            .select("slug, publish_at, updated_at, status")
            .order("publish_at", { ascending: false });

          const { data: posts } = await supabase
            .from("blog_posts")
            .select("slug, publish_at, updated_at, status")
            .order("publish_at", { ascending: false });

          if (Array.isArray(jobs)) {
            sitemapItems.push(
              ...jobs.map((job) => {
                const route = `/jobs/${job.slug}`;
                const lastmod = job.updated_at || job.publish_at || now;

                return publishRoute(route, lastmod, "weekly", "0.8");
              }),
            );
          }

          if (Array.isArray(posts)) {
            sitemapItems.push(
              ...posts.map((post) => {
                const route = `/blog/${post.slug}`;
                const lastmod = post.updated_at || post.publish_at || now;

                return publishRoute(route, lastmod, "weekly", "0.8");
              }),
            );
          }
        }
      } catch (err) {
        console.warn("Sitemap warning:", err);
      }

      const sitemapXml =
        `<?xml version="1.0" encoding="UTF-8"?>\n` +
        `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
        `${sitemapItems.join("\n")}\n` +
        `</urlset>`;

      mkdirSync(outputDir, { recursive: true });
      writeFileSync(join(outputDir, "sitemap.xml"), sitemapXml, "utf8");

      try {
        const indexPath = join(outputDir, "index.html");
        const notFoundPath = join(outputDir, "404.html");

        if (existsSync(indexPath)) {
          copyFileSync(indexPath, notFoundPath);
        }
      } catch (err) {
        console.warn("404 warning:", err);
      }
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react(), tailwindcss(), devApiHandlerPlugin(), sitemapGeneratorPlugin(env)],

    resolve: {
      alias: {
        "@": resolve(__dirname, "src").replace(/\\/g, "/") + "/",
      },
    },

    optimizeDeps: {
      include: ["react", "react-dom", "react-router-dom"],
    },

    build: {
      target: "es2019",
      sourcemap: false,
      minify: "esbuild",
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules/react") || id.includes("node_modules/react-dom") || id.includes("node_modules/react-router-dom")) {
              return "vendor-react";
            }

            if (id.includes("node_modules/@supabase")) {
              return "vendor-supabase";
            }

            if (id.includes("node_modules/lucide-react") || id.includes("node_modules/@radix-ui") || id.includes("node_modules/sonner") || id.includes("node_modules/clsx") || id.includes("node_modules/tailwind-merge")) {
              return "vendor-ui";
            }

            if (id.includes("/src/pages/candidate/")) {
              return "feature-candidate";
            }

            if (id.includes("/src/pages/admin/")) {
              return "feature-admin";
            }
          },
        },
      },
    },
  };
});
