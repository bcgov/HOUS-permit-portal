import { useEffect, useRef } from "react"
import { useLocation } from "react-router-dom"
import { IScrollPeekState, nextScrollPeekState } from "./scroll-peek-state"

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

function scrollMetricsOf(target: EventTarget): { scrollTop: number; maxScroll: number } {
  const el = target === document || target === window ? document.documentElement : (target as HTMLElement)
  const scrollTop = target === document || target === window ? window.scrollY : (el.scrollTop ?? 0)
  return { scrollTop, maxScroll: Math.max(0, el.scrollHeight - el.clientHeight) }
}

function readNavBarHeight(): number {
  const declared = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--app-navbar-height"))
  return Number.isFinite(declared) ? declared : FALLBACK_NAVBAR_HEIGHT_PX
}

/**
 * Tucks the top nav bar 1:1 with page scroll (Amazon-style): 5px down hides 5px of
 * the bar, then it parks just off-screen; 5px up reveals 5px from any depth.
 * Writes --app-navbar-offset so scrolling never re-renders React.
 */
export function useScrollAwareNavBar() {
  const location = useLocation()
  const revealRef = useRef<() => void>(() => {})

  useEffect(() => {
    const root = document.documentElement
    const barHeight = readNavBarHeight()
    const lastScrollTops = new WeakMap<EventTarget, number>()

    let state: IScrollPeekState = { hiddenPx: 0 }
    let frame = 0
    let pendingTarget: EventTarget | null = null

    const apply = () => {
      root.style.setProperty("--app-navbar-offset", `${barHeight - state.hiddenPx}px`)
    }

    const reveal = () => {
      state = { hiddenPx: 0 }
      apply()
    }
    revealRef.current = reveal

    const sample = () => {
      frame = 0
      const target = pendingTarget
      pendingTarget = null
      if (!target) return

      const { scrollTop, maxScroll } = scrollMetricsOf(target)
      const previous = lastScrollTops.get(target)
      lastScrollTops.set(target, scrollTop)

      state = nextScrollPeekState(state, {
        delta: previous === undefined ? 0 : scrollTop - previous,
        scrollTop,
        maxScroll,
        barHeight,
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
      root.style.removeProperty("--app-navbar-offset")
    }
  }, [])

  useEffect(() => {
    revealRef.current()
  }, [location.pathname])
}
