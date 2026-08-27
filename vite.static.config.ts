import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

export default defineConfig({
  root: fileURLToPath(new URL("./static-src/", import.meta.url)),
  base: "./",
  publicDir: false,
  plugins: [react()],
  build: {
    outDir: fileURLToPath(new URL("./static-site/", import.meta.url)),
    emptyOutDir: true,
    assetsDir: "assets",
    target: "es2020",
  },
});
