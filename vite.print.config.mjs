import react from "@vitejs/plugin-react"
import { createHash } from "node:crypto"
import { readFileSync, readdirSync } from "node:fs"
import { defineConfig } from "vite"

function sourceDigest() {
  const walk = (dir) =>
    readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const path = `${dir}/${entry.name}`
      if (entry.name === "__tests__") return []
      return entry.isDirectory() ? walk(path) : /\.(tsx?|css)$/.test(path) ? [path] : []
    })
  const hash = createHash("sha256")
  for (const path of [
    ...walk("app/frontend/components/print"),
    "app/frontend/i18n/i18n.ts",
    "vite.print.config.mjs",
  ].sort()) {
    hash
      .update(path + "\0")
      .update(readFileSync(path))
      .update("\0")
  }
  return hash.digest("hex")
}

// An isolated browser bundle, not SSR: ReportShell uses effects and a body portal.
export default defineConfig({
  publicDir: false,
  plugins: [
    react(),
    {
      name: "report-source-manifest",
      generateBundle() {
        this.emitFile({
          type: "asset",
          fileName: "manifest.json",
          source: JSON.stringify({ sourceDigest: sourceDigest() }),
        })
      },
    },
  ],
  define: { "process.env.NODE_ENV": JSON.stringify("production") },
  build: {
    outDir: "public/vite-print",
    emptyOutDir: true,
    lib: {
      entry: "app/frontend/components/print/generation-entry.tsx",
      name: "BPHReport",
      formats: ["iife"],
      fileName: () => "report.js",
      cssFileName: "report",
    },
  },
})
