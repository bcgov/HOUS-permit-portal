// Run: node --test app/frontend/utils/__tests__/round-metric.test.mjs
import assert from "node:assert/strict"
import { test } from "node:test"
import { fileURLToPath } from "node:url"
import { build } from "vite"

// Bundle the actual utility, selecting only this export and its dependencies.
const entry = fileURLToPath(new URL("../utility-functions.ts", import.meta.url))
const result = await build({
  configFile: false,
  logLevel: "silent",
  plugins: [
    {
      name: "metric-test-entry",
      resolveId(id) {
        if (id.endsWith("virtual:metric-test")) return id
      },
      load(id) {
        if (id.endsWith("virtual:metric-test")) return `export { roundMetric } from ${JSON.stringify(entry)}`
      },
    },
  ],
  build: {
    write: false,
    minify: false,
    lib: { entry: "virtual:metric-test", formats: ["es"] },
  },
})
const chunk = (Array.isArray(result) ? result[0] : result).output.find(
  (output) => output.type === "chunk" && output.isEntry
)
const { roundMetric } = await import(`data:text/javascript;base64,${Buffer.from(chunk.code).toString("base64")}`)

test("numeric and string zero remain visible at the requested precision", () => {
  for (const value of [0, "0", "0.00"]) {
    assert.equal(roundMetric(value), "0.00000")
    assert.equal(roundMetric(value, 2), "0.00")
    assert.equal(roundMetric(value, 0), "0")
  }
})

test("missing and invalid values retain the dash placeholder", () => {
  for (const value of [null, undefined, "", " ", NaN, "invalid"]) {
    assert.equal(roundMetric(value), "-")
  }
})

test("nonzero metrics retain existing rounding", () => {
  assert.equal(roundMetric(12.345678), "12.34568")
  assert.equal(roundMetric("12.345678"), "12.34568")
  assert.equal(roundMetric(-1.234, 2), "-1.23")
})
