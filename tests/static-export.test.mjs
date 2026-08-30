import assert from "node:assert/strict";
import { readdir, readFile, stat } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const outputRootUrl = new URL("../static-site/", import.meta.url);
const outputRoot = fileURLToPath(outputRootUrl);

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

test("exports an upload-ready static portfolio", async () => {
  const index = await readFile(new URL("index.html", outputRootUrl), "utf8");
  assert.match(index, /<title>YONG QI — Portfolio 2026<\/title>/);
  assert.match(index, /<link rel="preload" href="\.\/portfolio-ufo-cover\.jpg" as="image" fetchpriority="high" \/>/);
  assert.match(index, /<link rel="preload" href="\.\/portfolio-title\.png" as="image" fetchpriority="high" \/>/);
  assert.match(index, /<script type="module" crossorigin src="\.\/assets\/[^".]+\.js"><\/script>/);
  assert.match(index, /<link rel="stylesheet" crossorigin href="\.\/assets\/[^".]+\.css">/);

  for (const required of [
    "favicon.png",
    "portfolio-ufo-cover.jpg",
    "portfolio-cover-2026.mp4",
    "portfolio-title.png",
    "inside-title.png",
    "illustrations/sticker-product-knight.png",
    "v2/ssww/07.webp",
    "v2/renders/home/green-sofa.webp",
    "v2/renders/daily-care/perfume-motion.gif",
    "v2/aigc-process/set-02/03.webp",
    "v2/aigc-process/set-03/03.jpg",
    "v2/crossborder/truck-roll-bar/a-plus.jpg",
    "v2/crossborder/truck-roll-bar/strategy-hero.jpg",
    "v2/crossborder/truck-roll-bar/01.jpg",
    "preview/v2/crossborder/truck-roll-bar/strategy-hero.webp",
    "preview/v2/aigc-process/set-03/03.webp",
    "preview/v2/renders/daily-care/perfume-motion.webp",
  ]) {
    const info = await stat(new URL(required, outputRootUrl));
    assert.ok(info.isFile(), `${required} should exist in the static package`);
  }

  const files = await listFiles(outputRoot);
  const oversized = [];
  for (const file of files) {
    const info = await stat(file);
    if (info.size > 25 * 1024 * 1024) oversized.push(file);
  }
  assert.deepEqual(oversized, []);
  assert.doesNotMatch(files.join("\n"), /green-lounge(?:-original|-silent|-web)?\.mp4/i);

  const previewFiles = files.filter((file) => file.includes(`${join("static-site", "preview")}`));
  assert.ok(previewFiles.length >= 60, "the static package should include lightweight WebP previews");
  let previewBytes = 0;
  for (const file of previewFiles) {
    const info = await stat(file);
    previewBytes += info.size;
    assert.ok(info.size < 2 * 1024 * 1024, `${file} should stay below 2 MB for progressive preview loading`);
  }
  assert.ok(previewBytes > 18 * 1024 * 1024 && previewBytes < 40 * 1024 * 1024, "preview image budget should preserve detail on high-density screens without replacing full-resolution originals");

});
