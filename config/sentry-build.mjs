import { sentryVitePlugin } from "@sentry/vite-plugin"
import { readFileSync } from "node:fs"

export function sentryUploadOptions(token, release) {
  return {
    org: "bc-government-ministry-of-hous",
    project: "bph-frontend",
    authToken: token,
    telemetry: false,
    // Plugin upload errors can otherwise be recoverable. Fail image publication.
    errorHandler: (error) => {
      throw error
    },
    release: { name: release },
    sourcemaps: {
      assets: "public/vite/**",
      filesToDeleteAfterUpload: "public/vite/**/*.map",
    },
  }
}

// Called only for explicit deployment uploads. This module never reads local secrets files.
export function sentryBuildOptions(env = process.env) {
  if (env.SENTRY_UPLOAD_SOURCEMAPS !== "true") return { plugins: [], build: { sourcemap: false } }
  const tokenPath = "/run/secrets/sentry_auth_token"
  const token = readFileSync(tokenPath, "utf8").trim()
  if (!token || !/^hous-permit-portal@[a-f0-9]{40}$/.test(env.SENTRY_RELEASE ?? "")) {
    throw new Error("Sentry uploads require the build secret and a checked-out release SHA")
  }
  return {
    build: { sourcemap: "hidden" },
    plugins: [sentryVitePlugin(sentryUploadOptions(token, env.SENTRY_RELEASE))],
  }
}
