export interface IScrollPeekState {
  /** Pixels of the bar translated off-screen. 0 = fully shown, barHeight = fully hidden. */
  hiddenPx: number
}

export interface IScrollPeekInput {
  /** Change in scrollTop since the previous sample. Positive means scrolling down. */
  delta: number
  scrollTop: number
  /** scrollHeight - clientHeight. Used to tell a bottom clamp from a user scroll-up. */
  maxScroll: number
  /** Full height of the bar; hiddenPx is clamped to [0, barHeight]. */
  barHeight: number
}

export function nextScrollPeekState(state: IScrollPeekState, input: IScrollPeekInput): IScrollPeekState {
  const { delta, scrollTop, maxScroll, barHeight } = input
  const atBottom = scrollTop >= maxScroll - 1

  // Real top of a page that still overflows. A clamp that ate the leftover
  // overflow also lands on scrollTop 0, but that is the new bottom — leave it.
  if (scrollTop <= 0 && !(atBottom && state.hiddenPx > 0)) return { hiddenPx: 0 }

  // Browser clamped scrollTop because the scroller got taller (the in-flow
  // region reclaimed the bar). Still at the bottom, so this is not a user scroll-up.
  if (delta < 0 && atBottom) return state
  if (delta === 0) return state

  return { hiddenPx: Math.min(barHeight, Math.max(0, state.hiddenPx + delta)) }
}
