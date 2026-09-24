import { useEffect, useLayoutEffect, useRef } from "react"
import { useLocation } from "react-router-dom"
import { IScrollPeekState, nextBarHeightState, nextScrollPeekState } from "./scroll-peek-state"

export const APP_NAV_CHROME_ID = "appNavChrome"
const FALLBACK_NAVBAR_HEIGHT_PX = 58

/**
 * A scroller counts as page-level if it is roughly viewport-sized. This keeps narrow
 * sidebars, dropdown lists and other small overflow areas from driving the nav bar.
 *
 * Overlay dialogs/drawers are never page scroll even when they fill the viewport —
 * peeking the bar would shift --app-navbar-offset and jump the overlay. Non-dialog
 * inner panes that should also be ignored can set data-scroll-peek-ignore.
 */
function isPageLevelScroller(target: EventTarget | null): boolean {
  if (!target) return false
  if (target === document || target === window || target === document.documentElement) return true
  if (!(target instanceof HTMLElement)) return false
  if (target.closest("[data-scroll-peek-ignore], [role='dialog'], [role='alertdialog']")) return false

  return target.clientWidth >= window.innerWidth * 0.5 && target.clientHeight >= window.innerHeight * 0.5
}

function scrollMetricsOf(target: EventTarget): { scrollTop: number; maxScroll: number } {
  const el = target === document || target === window ? document.documentElement : (target as HTMLElement)
  const scrollTop = target === document || target === window ? window.scrollY : (el.scrollTop ?? 0)
  return { scrollTop, maxScroll: Math.max(0, el.scrollHeight - el.clientHeight) }
}

export function readNavBarHeight(): number {
  const chrome = document.getElementById(APP_NAV_CHROME_ID)
  if (chrome) return chrome.offsetHeight
  const declared = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--app-navbar-bar-height"))
  return Number.isFinite(declared) ? declared : FALLBACK_NAVBAR_HEIGHT_PX
}

/**
 * Tucks the top nav chrome 1:1 with page scroll (Amazon-style): 5px down hides 5px of
 * the bar, then it parks just off-screen; 5px up reveals 5px from any depth.
 * Measures #appNavChrome so the training banner tucks with the blue bar.
 * Writes --app-navbar-offset so scrolling never re-renders React.
 */
export function useScrollAwareNavBar() {
  const location = useLocation()
  const revealRef = useRef<() => void>(() => {})

  useLayoutEffect(() => {
    const root = document.documentElement
    const lastScrollTops = new WeakMap<EventTarget, number>()

    let barHeight = readNavBarHeight()
    let state: IScrollPeekState = { hiddenPx: 0 }
    let frame = 0
    let pendingTarget: EventTarget | null = null

    const apply = () => {
      root.style.setProperty("--app-navbar-height", `${barHeight}px`)
      root.style.setProperty("--app-navbar-offset", `${barHeight - state.hiddenPx}px`)
    }

    const adoptHeight = (next: number) => {
      if (next === barHeight) return
      state = nextBarHeightState(state, barHeight, next)
      barHeight = next
    }

    const syncHeight = () => {
      const next = readNavBarHeight()
      if (next === barHeight) return
      adoptHeight(next)
      apply()
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

      adoptHeight(readNavBarHeight())
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

    // Keyboard users tabbing into the chrome must never land on something off-screen.
    const onFocusIn = (event: FocusEvent) => {
      if ((event.target as HTMLElement | null)?.closest?.(`#${APP_NAV_CHROME_ID}`)) reveal()
    }

    const chrome = document.getElementById(APP_NAV_CHROME_ID)
    const resizeObserver = chrome ? new ResizeObserver(syncHeight) : null
    if (chrome && resizeObserver) resizeObserver.observe(chrome)
    apply()

    document.addEventListener("scroll", onScroll, true)
    document.addEventListener("focusin", onFocusIn)

    return () => {
      document.removeEventListener("scroll", onScroll, true)
      document.removeEventListener("focusin", onFocusIn)
      resizeObserver?.disconnect()
      if (frame) cancelAnimationFrame(frame)
      root.style.removeProperty("--app-navbar-offset")
      root.style.removeProperty("--app-navbar-height")
    }
  }, [])

  useEffect(() => {
    revealRef.current()
  }, [location.pathname])
}
