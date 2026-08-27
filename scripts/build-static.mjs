import react from "@vitejs/plugin-react";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { build, createServer } from "vite";
import { copyFile, mkdir, readFile, readdir, stat } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const publicRoot = join(projectRoot, "public");
const outputRoot = join(projectRoot, "static-site");
const staticConfig = join(projectRoot, "vite.static.config.ts");
const maxFileSize = 25 * 1024 * 1024;

await build({ configFile: staticConfig });

const server = await createServer({
  configFile: false,
  root: projectRoot,
  appType: "custom",
  logLevel: "error",
  optimizeDeps: { noDiscovery: true, include: [] },
  plugins: [react()],
  server: { middlewareMode: true },
});

let renderedPage;
try {
  const pageModule = await server.ssrLoadModule("/app/page.tsx");
  renderedPage = renderToStaticMarkup(createElement(pageModule.default));
} finally {
  await server.close();
}

const stylesheet = await readFile(join(projectRoot, "app", "globals.css"), "utf8");
const assetPaths = new Set(["/favicon.png", "/og.png"]);

for (const match of renderedPage.matchAll(/(?:src|href|poster|srcset|data-preload-src)="(\/[^"]+\.(?:png|jpe?g|webp|gif|mp4))"/gi)) {
  assetPaths.add(match[1]);
}

for (const match of stylesheet.matchAll(/url\(\s*["']?(\/[^")']+)["']?\s*\)/gi)) {
  assetPaths.add(match[1]);
}

let copiedBytes = 0;
for (const assetPath of [...assetPaths].sort()) {
  const cleanPath = decodeURIComponent(assetPath.split(/[?#]/, 1)[0]).replace(/^\/+/, "");
  const source = join(publicRoot, cleanPath);
  const destination = join(outputRoot, cleanPath);
  const info = await stat(source).catch(() => null);
  if (!info?.isFile()) throw new Error(`Missing public asset required by the page: ${assetPath}`);
  await mkdir(dirname(destination), { recursive: true });
  await copyFile(source, destination);
  copiedBytes += info.size;
}

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolute = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await listFiles(absolute));
    if (entry.isFile()) files.push(absolute);
  }
  return files;
}

const outputFiles = await listFiles(outputRoot);
const oversized = [];
let outputBytes = 0;
for (const file of outputFiles) {
  const info = await stat(file);
  outputBytes += info.size;
  if (info.size > maxFileSize) oversized.push(`${relative(outputRoot, file)} (${(info.size / 1024 / 1024).toFixed(2)} MB)`);
}

if (oversized.length) throw new Error(`Static export contains files over 25 MB:\n${oversized.join("\n")}`);

const indexFile = join(outputRoot, "index.html");
const indexInfo = await stat(indexFile).catch(() => null);
if (!indexInfo?.isFile()) throw new Error("Static export did not produce index.html.");

console.log(`Static portfolio ready: ${relative(projectRoot, outputRoot)}`);
console.log(`Copied ${assetPaths.size} referenced assets (${(copiedBytes / 1024 / 1024).toFixed(2)} MB).`);
console.log(`Package total: ${outputFiles.length} files, ${(outputBytes / 1024 / 1024).toFixed(2)} MB; no file exceeds 25 MB.`);
