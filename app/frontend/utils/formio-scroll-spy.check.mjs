// ponytail: assert-based self-check mirroring pickScrollSpyBlockIndex in use-block-scroll-spy.ts
// Ceiling: duplicated logic — if the picker changes, update this file too.
// Run: node app/frontend/utils/formio-scroll-spy.check.mjs

import assert from "node:assert/strict"

const pickScrollSpyBlockIndex = (intersectingTargets, visibleBlockNodes, midY) => {
  let bestIndex = -1
  let bestDist = Infinity

  for (const node of intersectingTargets) {
    const index = visibleBlockNodes.indexOf(node)
    if (index < 0) continue
    const rect = node.getBoundingClientRect()
    const dist = Math.abs(rect.top + rect.height / 2 - midY)
    if (dist < bestDist || (dist === bestDist && index > bestIndex)) {
      bestDist = dist
      bestIndex = index
    }
  }

  return bestIndex
}

const makeNode = (top, height) => ({
  getBoundingClientRect: () => ({ top, height }),
})

const a = makeNode(0, 100) // center 50
const b = makeNode(200, 100) // center 250
const c = makeNode(400, 100) // center 450
const visible = [a, b, c]
const midY = 240

assert.equal(pickScrollSpyBlockIndex([a, b], visible, midY), 1, "closest to midline wins")
assert.equal(pickScrollSpyBlockIndex([a], visible, midY), 0)
assert.equal(pickScrollSpyBlockIndex([], visible, midY), -1)
assert.equal(
  pickScrollSpyBlockIndex([a, c], visible, 250),
  2,
  "equidistant centers → later in document order"
)

const d = makeNode(200, 100)
const e = makeNode(200, 100)
assert.equal(pickScrollSpyBlockIndex([d, e], [d, e], 250), 1, "equal distance → later in document order")

console.log("formio-scroll-spy.check.mjs: ok")
