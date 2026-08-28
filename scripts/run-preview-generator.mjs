import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const bundledPython = join(
  homedir(),
  ".cache",
  "codex-runtimes",
  "codex-primary-runtime",
  "dependencies",
  "python",
  process.platform === "win32" ? "python.exe" : "bin/python",
);
const candidates = [
  ...(existsSync(bundledPython) ? [bundledPython] : []),
  "python3",
  "python",
];

for (const executable of candidates) {
  const result = spawnSync(executable, ["scripts/generate-preview-assets.py"], { stdio: "inherit" });
  if (!result.error && result.status === 0) process.exit(0);
}

throw new Error("A Python runtime with Pillow is required to regenerate preview images.");
