// ponytail: assert-based self-check mirroring helpers in formio-component-traversal.ts (no test framework).
// Ceiling: duplicated logic — if the TS helpers change, update this file too.
// Run: node app/frontend/utils/formio-sidebar-visibility.check.mjs

import assert from "node:assert/strict"

const reconcileSelectedTabIndex = (previousVisibleKeys, nextVisibleKeys, selectedTabIndex) => {
  if (nextVisibleKeys.length === 0) return 0
  const prevKey = previousVisibleKeys[selectedTabIndex]
  if (prevKey) {
    const stillVisibleIndex = nextVisibleKeys.indexOf(prevKey)
    if (stillVisibleIndex !== -1) return stillVisibleIndex
  }
  for (let i = selectedTabIndex - 1; i >= 0; i--) {
    const idx = nextVisibleKeys.indexOf(previousVisibleKeys[i])
    if (idx !== -1) return idx
  }
  for (let i = selectedTabIndex + 1; i < previousVisibleKeys.length; i++) {
    const idx = nextVisibleKeys.indexOf(previousVisibleKeys[i])
    if (idx !== -1) return idx
  }
  return Math.min(selectedTabIndex, nextVisibleKeys.length - 1)
}

const scrollAdjustmentForHiddenBlocks = (previousLayouts, hiddenKeys, scrollY) => {
  let adjustment = 0
  for (const { key, absTop, height } of previousLayouts) {
    if (!hiddenKeys.has(key) || height <= 0) continue
    if (absTop < scrollY) {
      adjustment += Math.min(height, scrollY - absTop)
    }
  }
  return adjustment
}

assert.equal(reconcileSelectedTabIndex(["a", "b", "c"], ["a", "b", "c"], 1), 1)
assert.equal(reconcileSelectedTabIndex(["a", "b", "c"], ["a", "c"], 1), 0, "hidden selected → prior sibling")
assert.equal(reconcileSelectedTabIndex(["a", "b", "c"], ["a", "c"], 2), 1, "later tab remaps after middle hide")
assert.equal(reconcileSelectedTabIndex(["a", "b"], ["b"], 0), 0, "first hidden → next remaining")

assert.equal(
  scrollAdjustmentForHiddenBlocks(
    [
      { key: "above", absTop: 100, height: 400 },
      { key: "below", absTop: 900, height: 400 },
    ],
    new Set(["above"]),
    500
  ),
  400
)
assert.equal(
  scrollAdjustmentForHiddenBlocks([{ key: "below", absTop: 900, height: 400 }], new Set(["below"]), 500),
  0,
  "blocks below viewport do not adjust scroll"
)

console.log("formio-sidebar-visibility.check.mjs: ok")
