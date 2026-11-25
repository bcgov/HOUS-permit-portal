// Builds a standalone synthetic UI, then serves only its generated assets on loopback.
import { mkdir, readFile, writeFile } from "node:fs/promises"
import { createServer } from "node:http"
import { resolve } from "node:path"
import { build } from "vite"

const directory = resolve("tmp/sentry-browser")
await mkdir(directory, { recursive: true })
await build({
  configFile: false,
  envFile: false,
  publicDir: false,
  logLevel: "warn",
  define: { "process.env.NODE_ENV": JSON.stringify("production") },
  build: {
    outDir: directory,
    emptyOutDir: true,
    lib: {
      entry: resolve("scripts/sentry/browser-fixture.tsx"),
      formats: ["iife"],
      name: "SentryOfflineFixture",
      fileName: () => "fixture.js",
    },
  },
})
await writeFile(
  directory + "/index.html",
  '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Offline Sentry UI fixture</title><div id="root"></div><script src="/fixture.js"></script>'
)
const files = { "/": ["index.html", "text/html"], "/fixture.js": ["fixture.js", "text/javascript"] }
const server = createServer(async (request, response) => {
  const file = files[request.url]
  if (!file) {
    response.writeHead(404).end()
    return
  }
  response.writeHead(200, { "Content-Type": file[1] })
  response.end(await readFile(directory + "/" + file[0]))
})
server.listen(4179, "127.0.0.1", () =>
  console.log(
    "Offline synthetic UI: http://127.0.0.1:4179 — Ctrl-C to stop. Normal local application capture is unchanged."
  )
)
