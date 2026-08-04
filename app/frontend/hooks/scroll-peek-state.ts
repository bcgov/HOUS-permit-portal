export interface IScrollPeekState {
  hidden: boolean
  /** Distance travelled in the current direction; sign encodes the direction. */
  travel: number
}

export interface IScrollPeekInput {
  /** Change in scrollTop since the previous sample. Positive means scrolling down. */
  delta: number
  scrollTop: number
  /** Above this scroll depth the bar is always shown, so the top of a page is never obscured. */
  anchorDepth: number
  /** Uninterrupted travel required to flip state, which is what stops jitter from flickering the bar. */
  threshold: number
}

export function nextScrollPeekState(state: IScrollPeekState, input: IScrollPeekInput): IScrollPeekState {
  const { delta, scrollTop, anchorDepth, threshold } = input

  if (scrollTop <= anchorDepth) return { hidden: false, travel: 0 }
  if (delta === 0) return state

  // Reversing direction restarts the tally, so a reveal costs the same small
  // upward gesture whether the user has scrolled down 100px or 10,000px.
  const travel = delta > 0 === state.travel > 0 ? state.travel + delta : delta

  if (travel >= threshold) return { hidden: true, travel }
  if (travel <= -threshold) return { hidden: false, travel }
  return { hidden: state.hidden, travel }
}
