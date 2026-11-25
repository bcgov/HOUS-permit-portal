import ReactPlugin from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import RubyPlugin from "vite-plugin-ruby"
import { sentryBuildOptions } from "./config/sentry-build.mjs"

const sentry = sentryBuildOptions()

export default defineConfig({
  css: {
    lightningcss: {
      errorRecovery: true,
    },
  },
  plugins: [RubyPlugin(), ReactPlugin(), ...sentry.plugins],
  build: sentry.build,
})
