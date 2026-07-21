import { mkdirSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");

const defaultRoutes = ["/", "/about", "/services", "/jobs", "/blog", "/contact"];

function buildStaticShell(route) {
  return `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>EmploiPlus Group</title>
    <meta name="description" content="Trouvez votre prochain emploi ou stage en République du Congo. Découvrez les meilleures opportunités de recrutement à Brazzaville et Pointe-Noire sur Emploi+." />
    <meta name="robots" content="index,follow" />
    <link rel="canonical" href="https://emploiplus-group.com${route}" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;
}

export async function prerenderRoutes({ outputDir = "dist", routes = defaultRoutes } = {}) {
  const resolvedOutputDir = join(rootDir, outputDir);
  mkdirSync(resolvedOutputDir, { recursive: true });

  const indexPath = join(resolvedOutputDir, "index.html");
  if (!existsSync(indexPath)) {
    throw new Error("Vite build output not found. Run vite build first.");
  }

  const baseHtml = readFileSync(indexPath, "utf8");

  for (const route of routes) {
    const targetPath = join(resolvedOutputDir, route === "/" ? "index.html" : `${route.replace(/^\//, "")}/index.html`);
    mkdirSync(dirname(targetPath), { recursive: true });

    const htmlWithShell = baseHtml
      .replace(/<title>.*?<\/title>/s, "<title>EmploiPlus Group</title>")
      .replace(/<meta name=\"description\" content=\".*?\"/s, '<meta name="description" content="Trouvez votre prochain emploi ou stage en République du Congo. Découvrez les meilleures opportunités de recrutement à Brazzaville et Pointe-Noire sur Emploi+."')
      .replace(/<meta name=\"robots\" content=\".*?\"/s, '<meta name="robots" content="index,follow"')
      .replace(/<link rel=\"canonical\" href=\".*?\"/s, `<link rel="canonical" href="https://emploiplus-group.com${route}" />`);

    writeFileSync(targetPath, htmlWithShell, "utf8");
    console.log(`Prerendered ${route} -> ${targetPath}`);
  }
}

if (process.argv[1] && process.argv[1].includes("prerender.js")) {
  const outputDir = process.argv[2] || "dist";
  const routes = process.argv.slice(3);
  await prerenderRoutes({ outputDir, routes: routes.length > 0 ? routes : defaultRoutes });
}
