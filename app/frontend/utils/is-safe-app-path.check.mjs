// Runnable check for isSafeAppPath (keep in sync with utility-functions.ts).
// node app/frontend/utils/is-safe-app-path.check.mjs

function isSafeAppPath(path) {
  if (typeof path !== "string" || path.length === 0) return false
  if (!path.startsWith("/") || path.startsWith("//")) return false
  if (path.includes("\\") || path.includes("@")) return false
  if (/^[a-z][a-z0-9+.-]*:/i.test(path) || /(?:^|\/)javascript:/i.test(path)) return false
  return true
}

const cases = [
  ["/projects/abc", true],
  ["/jurisdictions/foo/submission-inbox", true],
  ["", false],
  ["projects", false],
  ["//evil.com", false],
  ["/\\evil.com", false],
  ["\\evil.com", false],
  ["/javascript:alert(1)", false],
  ["javascript:alert(1)", false],
  ["https://evil.com", false],
  ["/foo@evil.com", false],
]

let failed = 0
for (const [path, expected] of cases) {
  const got = isSafeAppPath(path)
  if (got !== expected) {
    console.error(`fail: isSafeAppPath(${JSON.stringify(path)}) => ${got}, expected ${expected}`)
    failed++
  }
}

if (failed) process.exit(1)
console.log(`ok (${cases.length} cases)`)
