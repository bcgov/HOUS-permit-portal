// Offline source-map checks. The only HTTP destination is a rejecting loopback server.
import { sentryVitePlugin } from "@sentry/vite-plugin"
import assert from "node:assert/strict"
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { createServer } from "node:http"
import { resolve } from "node:path"
import { test } from "node:test"
import { build } from "vite"
import { sentryBuildOptions, sentryUploadOptions } from "../../config/sentry-build.mjs"

test("normal builds have no maps, uploads, or secret dependency", () => {
  assert.deepEqual(sentryBuildOptions({}), { plugins: [], build: { sourcemap: false } })
  assert.throws(() => sentryBuildOptions({ SENTRY_UPLOAD_SOURCEMAPS: "true" }))
})

test("hidden maps share a debug ID and the cleanup hook removes maps while preserving JS", async () => {
  const directory = await mkdtemp(resolve("tmp/codex-planning/sentry-map-"))
  try {
    await writeFile(directory + "/entry.ts", 'export function synthetic() { throw new Error("synthetic") }')
    await build({
      configFile: false,
      envFile: false,
      publicDir: false,
      logLevel: "silent",
      plugins: [
        sentryVitePlugin({
          telemetry: false,
          release: { inject: false, create: false, finalize: false },
          sourcemaps: { disable: "disable-upload" },
        }),
      ],
      build: {
        outDir: directory + "/assets",
        sourcemap: "hidden",
        lib: { entry: directory + "/entry.ts", formats: ["es"], fileName: () => "synthetic.mjs" },
      },
    })
    const code = await readFile(directory + "/assets/synthetic.mjs", "utf8")
    const map = JSON.parse(await readFile(directory + "/assets/synthetic.mjs.map", "utf8"))
    assert.ok(map.debug_id)
    assert.ok(code.includes(map.debug_id))
    assert.equal(code.includes("sourceMappingURL="), false)
    await build({
      configFile: false,
      envFile: false,
      publicDir: false,
      logLevel: "silent",
      plugins: [
        sentryVitePlugin({
          ...sentryUploadOptions("", "synthetic"),
          release: { inject: false, create: false, finalize: false },
          sourcemaps: { disable: "disable-upload", filesToDeleteAfterUpload: directory + "/assets/**/*.map" },
        }),
      ],
      build: {
        outDir: directory + "/assets",
        sourcemap: "hidden",
        lib: { entry: directory + "/entry.ts", formats: ["es"], fileName: () => "synthetic.mjs" },
      },
    })
    await assert.rejects(readFile(directory + "/assets/synthetic.mjs.map"), { code: "ENOENT" })
    assert.ok((await readFile(directory + "/assets/synthetic.mjs", "utf8")).length)
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})

test("an upload rejected by the destination fails the build", { timeout: 45000 }, async () => {
  const directory = await mkdtemp(resolve("tmp/codex-planning/sentry-upload-"))
  const requests = []
  const server = createServer((request, response) => {
    requests.push(request.url)
    response.writeHead(401, { "Content-Type": "application/json" }).end('{"detail":"Synthetic rejection"}')
  })
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve))
  try {
    await writeFile(directory + "/entry.ts", 'export const synthetic = "synthetic"')
    await assert.rejects(
      build({
        configFile: false,
        envFile: false,
        publicDir: false,
        logLevel: "silent",
        plugins: [
          sentryVitePlugin({
            ...sentryUploadOptions("synthetic-only", "synthetic"),
            org: "synthetic",
            project: "synthetic",
            url: `http://127.0.0.1:${server.address().port}`,
            telemetry: false,
            release: { inject: false, create: false, finalize: false },
            sourcemaps: { assets: directory + "/assets/**" },
          }),
        ],
        build: {
          outDir: directory + "/assets",
          sourcemap: "hidden",
          lib: { entry: directory + "/entry.ts", formats: ["es"] },
        },
      })
    )
    assert.ok(requests.length > 0, "the uploader reached the rejecting loopback server")
  } finally {
    await new Promise((resolve) => server.close(resolve))
    await rm(directory, { recursive: true, force: true })
  }
})
