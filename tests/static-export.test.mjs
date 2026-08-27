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
  assert.match(index, /<script type="module" crossorigin src="\.\/assets\/[^".]+\.js"><\/script>/);
  assert.match(index, /<link rel="stylesheet" crossorigin href="\.\/assets\/[^".]+\.css">/);

  for (const required of [
    "favicon.png",
    "portfolio-ufo-cover.jpg",
    "portfolio-ufo-cover.mp4",
    "illustrations/sticker-product-knight.png",
    "v2/ssww/07.webp",
    "v2/renders/home/green-sofa.webp",
    "v2/renders/daily-care/perfume-motion.gif",
    "v2/aigc-process/set-02/03.webp",
    "v2/aigc-process/set-03/03.jpg",
    "v2/crossborder/truck-roll-bar/a-plus.jpg",
    "v2/crossborder/truck-roll-bar/strategy-hero.jpg",
    "v2/crossborder/truck-roll-bar/01.jpg",
    "mobile/v2/crossborder/truck-roll-bar/strategy-hero.webp",
    "mobile/v2/aigc-process/set-03/03.webp",
    "mobile/v2/renders/daily-care/perfume-motion.webp",
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

  const mobileFiles = files.filter((file) => file.includes(`${join("static-site", "mobile")}`));
  assert.ok(mobileFiles.length >= 60, "the static package should include responsive mobile images");
  let mobileBytes = 0;
  for (const file of mobileFiles) {
    const info = await stat(file);
    mobileBytes += info.size;
    assert.ok(info.size < 3 * 1024 * 1024, `${file} should stay below 3 MB for mobile loading`);
  }
  assert.ok(mobileBytes > 25 * 1024 * 1024 && mobileBytes < 38 * 1024 * 1024, "mobile image quality budget should stay near 30 MB");
});
