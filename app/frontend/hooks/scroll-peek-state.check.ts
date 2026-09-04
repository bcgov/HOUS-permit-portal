// Run with: node --experimental-strip-types app/frontend/hooks/scroll-peek-state.check.ts
import assert from "node:assert/strict"
import type { IScrollPeekState } from "./scroll-peek-state.ts"
import { nextScrollPeekState } from "./scroll-peek-state.ts"

const BAR = 58
const TALL = 10000

function replay(scrollTops: number[], start: IScrollPeekState = { hiddenPx: 0 }, maxScroll = TALL): IScrollPeekState {
  return scrollTops.reduce((state, scrollTop, index) => {
    const previous = index === 0 ? scrollTop : scrollTops[index - 1]
    return nextScrollPeekState(state, {
      delta: scrollTop - previous,
      scrollTop,
      maxScroll,
      barHeight: BAR,
    })
  }, start)
}

assert.equal(replay([0, 5, 10, 15]).hiddenPx, 15, "5px down tucks 5px of the bar")

assert.equal(replay([0, 5, 10, 5]).hiddenPx, 5, "5px up reveals 5px of the bar")

assert.equal(replay([0, 200, 400, 600]).hiddenPx, BAR, "the bar parks once it is fully off-screen")

assert.equal(replay([0, 600, 595]).hiddenPx, 53, "5px up from fully hidden reveals 5px")

assert.equal(replay([0, 9000, 8995]).hiddenPx, 53, "a reveal costs the same pixels no matter how far down the page")

assert.equal(replay([0, 600, 0]).hiddenPx, 0, "returning to the top always shows the bar")

assert.equal(replay([0, 30]).hiddenPx, 30, "shallow scrolling tucks the bar by the same amount")

assert.equal(
  replay([0, 20, 40, 50], { hiddenPx: 0 }, 50).hiddenPx,
  50,
  "short pages still tuck 1:1 for as far as they can scroll"
)

const tucked = replay([0, 200, 400])
assert.equal(tucked.hiddenPx, BAR, "setup: tall page parks the bar on the way down")
assert.equal(
  nextScrollPeekState(tucked, {
    delta: -BAR,
    scrollTop: 400 - BAR,
    maxScroll: 400 - BAR,
    barHeight: BAR,
  }).hiddenPx,
  BAR,
  "bottom clamp after tuck does not reveal"
)

assert.equal(
  nextScrollPeekState(
    { hiddenPx: 20 },
    {
      delta: -20,
      scrollTop: 0,
      maxScroll: 0,
      barHeight: BAR,
    }
  ).hiddenPx,
  20,
  "clamp that eats leftover overflow is not a return to the top"
)

assert.equal(replay([0, 400, 390], { hiddenPx: 0 }, 400).hiddenPx, 48, "a real scroll up from the bottom still reveals")

console.log("scroll-peek-state: all checks passed")
