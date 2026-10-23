import { formatInTimeZone } from "date-fns-tz"
import assert from "node:assert/strict"
import { createRequire } from "node:module"
import { test } from "node:test"
import { fieldValue } from "../../components/print/form/field-values.ts"
import { moment } from "../formio-time-zones.ts"

const require = createRequire(import.meta.url)
const zone = "America/Vancouver"
const cases = [
  ["2026-01-15T20:00:00Z", "2026-01-15 12:00 -08:00"],
  ["2026-07-15T20:00:00Z", "2026-07-15 13:00 -07:00"],
  ["2026-11-01T08:59:00Z", "2026-11-01 01:59 -07:00"],
  ["2026-11-01T09:00:00Z", "2026-11-01 02:00 -07:00"],
  ["2026-11-03T07:01:00Z", "2026-11-03 00:01 -07:00"],
  ["2027-01-15T20:00:00Z", "2027-01-15 13:00 -07:00"],
]

for (const [instant, expected] of cases) {
  test(`Moment and runtime rules agree for ${instant}`, () => {
    assert.equal(moment.tz(instant, zone).format("YYYY-MM-DD HH:mm Z"), expected)
    assert.equal(formatInTimeZone(instant, zone, "yyyy-MM-dd HH:mm XXX"), expected)
  })
}

for (const packageName of ["@formio/js", "formiojs"]) {
  test(`${packageName} uses the initialized rules without fetching external data`, async () => {
    const formioRequire = createRequire(require.resolve(packageName))
    const formioMoment = formioRequire("moment-timezone/moment-timezone")
    const utils = formioRequire("./utils/utils.js")
    assert.equal(formioMoment, moment)
    assert.equal(formioMoment.tz.dataVersion, "2026e")
    assert.equal(utils.zonesLoaded(), true)

    const originalFetch = globalThis.fetch
    globalThis.fetch = () => {
      assert.fail("FormIO must use bundled rules instead of an external feed")
    }
    try {
      await utils.loadZones("https://example.invalid/timezones.json")
      assert.equal(
        utils.momentDate("2027-01-15T20:00:00Z", "YYYY-MM-DD HH:mm Z", zone).format("YYYY-MM-DD HH:mm Z"),
        "2027-01-15 13:00 -07:00"
      )
    } finally {
      globalThis.fetch = originalFetch
    }
  })
}

test("report dates preserve date-only answers and use the correct Vancouver day", () => {
  assert.equal(fieldValue({ type: "datetime" }, "2027-02-01"), "2027-02-01")
  const answer = fieldValue({ type: "datetime" }, "2027-02-01T07:30:00Z")
  assert.ok(answer.includes("2027-02-01"), answer)
})
