import ReactPlugin from "@vitejs/plugin-react"
import path from "node:path"
import { defineConfig } from "vite"
import RubyPlugin from "vite-plugin-ruby"

export default defineConfig({
  plugins: [RubyPlugin(), ReactPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "app/frontend"),
    },
  },
})
