// Run with: node --experimental-strip-types app/frontend/hooks/scroll-peek-state.check.ts
import assert from "node:assert/strict"
import type { IScrollPeekState } from "./scroll-peek-state.ts"
import { nextScrollPeekState } from "./scroll-peek-state.ts"

const ANCHOR = 58
const THRESHOLD = 8

/** Replays a sequence of scrollTop samples and returns whether the bar ends up hidden. */
function replay(scrollTops: number[], start: IScrollPeekState = { hidden: false, travel: 0 }): IScrollPeekState {
  return scrollTops.reduce((state, scrollTop, index) => {
    const previous = index === 0 ? scrollTop : scrollTops[index - 1]
    return nextScrollPeekState(state, {
      delta: scrollTop - previous,
      scrollTop,
      anchorDepth: ANCHOR,
      threshold: THRESHOLD,
    })
  }, start)
}

assert.equal(replay([0, 200, 400, 600]).hidden, true, "scrolling down hides the bar")

assert.equal(replay([0, 600, 590]).hidden, false, "a small scroll up reveals the bar again")

assert.equal(
  replay([0, 9000, 8990]).hidden,
  false,
  "a reveal costs the same small gesture no matter how far down the page"
)

assert.equal(replay([0, 600, 20]).hidden, false, "returning near the top always shows the bar")

assert.equal(replay([0, 30]).hidden, false, "shallow scrolling within the anchor depth leaves the bar shown")

// Sub-threshold jitter around a fixed position must not flip the bar in either direction.
const jitter = [0, 600, 603, 599, 604, 600, 602, 598, 601]
assert.equal(replay(jitter).hidden, true, "jitter does not reveal a hidden bar")
assert.equal(replay(jitter, { hidden: true, travel: 0 }).hidden, true, "jitter does not flicker a hidden bar")

// A gradual upward drag delivered in many tiny frames still adds up to a reveal.
assert.equal(
  replay([0, 600, 598, 596, 594, 592, 590]).hidden,
  false,
  "upward travel accumulates across frames to reach the threshold"
)

console.log("scroll-peek-state: all checks passed")
