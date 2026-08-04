import { useEffect, useRef } from "react"
import { useLocation } from "react-router-dom"
import { IScrollPeekState, nextScrollPeekState } from "./scroll-peek-state"

const ROOT_ATTRIBUTE = "data-navbar-hidden"
const TRAVEL_THRESHOLD_PX = 8
const FALLBACK_NAVBAR_HEIGHT_PX = 58

/**
 * A scroller counts as page-level if it is roughly viewport-sized. This keeps narrow
 * sidebars, dropdown lists and other small overflow areas from driving the nav bar.
 *
 * ponytail: a size heuristic rather than a registry of scroll containers, so pages get
 * the behaviour without opting in. If a page ever needs a viewport-sized inner scroller
 * that should *not* move the bar, swap this for an explicit `data-*` opt-out.
 */
function isPageLevelScroller(target: EventTarget | null): boolean {
  if (!target) return false
  if (target === document || target === window || target === document.documentElement) return true
  if (!(target instanceof HTMLElement)) return false

  return target.clientWidth >= window.innerWidth * 0.5 && target.clientHeight >= window.innerHeight * 0.5
}

function scrollTopOf(target: EventTarget): number {
  if (target === document || target === window) return window.scrollY
  return (target as HTMLElement).scrollTop ?? 0
}

function readNavBarHeight(): number {
  const declared = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--app-navbar-height"))
  return Number.isFinite(declared) ? declared : FALLBACK_NAVBAR_HEIGHT_PX
}

/**
 * Hides the top nav bar while the user scrolls down and brings it back as soon as they
 * scroll up, from any depth. Listens on the capture phase so the one listener covers the
 * window plus every nested scroll container in the app, and reports through the
 * `data-navbar-hidden` attribute so scrolling never re-renders React.
 */
export function useScrollAwareNavBar() {
  const location = useLocation()
  const revealRef = useRef<() => void>(() => {})

  useEffect(() => {
    const root = document.documentElement
    const anchorDepth = readNavBarHeight()
    const lastScrollTops = new WeakMap<EventTarget, number>()

    let state: IScrollPeekState = { hidden: false, travel: 0 }
    let frame = 0
    let pendingTarget: EventTarget | null = null

    const apply = () => {
      if (state.hidden) {
        root.setAttribute(ROOT_ATTRIBUTE, "true")
      } else {
        root.removeAttribute(ROOT_ATTRIBUTE)
      }
    }

    const reveal = () => {
      state = { hidden: false, travel: 0 }
      apply()
    }
    revealRef.current = reveal

    const sample = () => {
      frame = 0
      const target = pendingTarget
      pendingTarget = null
      if (!target) return

      const scrollTop = scrollTopOf(target)
      const previous = lastScrollTops.get(target)
      lastScrollTops.set(target, scrollTop)

      state = nextScrollPeekState(state, {
        delta: previous === undefined ? 0 : scrollTop - previous,
        scrollTop,
        anchorDepth,
        threshold: TRAVEL_THRESHOLD_PX,
      })
      apply()
    }

    const onScroll = (event: Event) => {
      if (!isPageLevelScroller(event.target)) return
      pendingTarget = event.target
      if (!frame) frame = requestAnimationFrame(sample)
    }

    // Keyboard users tabbing into the bar must never land on something off-screen.
    const onFocusIn = (event: FocusEvent) => {
      if ((event.target as HTMLElement | null)?.closest?.("#mainNav")) reveal()
    }

    document.addEventListener("scroll", onScroll, true)
    document.addEventListener("focusin", onFocusIn)

    return () => {
      document.removeEventListener("scroll", onScroll, true)
      document.removeEventListener("focusin", onFocusIn)
      if (frame) cancelAnimationFrame(frame)
      root.removeAttribute(ROOT_ATTRIBUTE)
    }
  }, [])

  useEffect(() => {
    revealRef.current()
  }, [location.pathname])
}
