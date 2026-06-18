import ReactPlugin from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import RubyPlugin from "vite-plugin-ruby"

export default defineConfig({
  css: {
    lightningcss: {
      errorRecovery: true,
    },
  },
  plugins: [RubyPlugin(), ReactPlugin()],
})
