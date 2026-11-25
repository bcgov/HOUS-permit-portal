import { MutableRefObject, useEffect, useRef, useState } from "react"
import { useMountStatus } from "../../../../../hooks/use-mount-status"
import { IFormJson } from "../../../../../types/types"

type BlockLayout = { key: string; absTop: number; height: number }

interface IUseBlockScrollSpyParams {
  boxRef: MutableRefObject<HTMLDivElement | null>
  formJson: IFormJson | null
  blockClasses: string[]
  visibilityVersion: number
  setSelectedTabIndex: (index: number) => void
  previousBlockLayoutsRef: MutableRefObject<BlockLayout[]>
  captureBlockLayouts: () => BlockLayout[]
}

const queryVisibleBlockNodes = (blockClasses: string[]) =>
  Array.from(document.querySelectorAll(".formio-component")).filter(
    (node) =>
      !node.classList.contains("formio-hidden") &&
      Array.from(node.classList).some((className) => blockClasses.includes(className))
  )

/** Among targets crossing the mid-viewport band, pick the one closest to the midline (document order as tiebreak). */
export const pickScrollSpyBlockIndex = (
  intersectingTargets: Iterable<Element>,
  visibleBlockNodes: Element[],
  midY: number
) => {
  let bestIndex = -1
  let bestDist = Infinity

  for (const node of intersectingTargets) {
    const index = visibleBlockNodes.indexOf(node)
    if (index < 0) continue
    const rect = (node as HTMLElement).getBoundingClientRect()
    const dist = Math.abs(rect.top + rect.height / 2 - midY)
    if (dist < bestDist || (dist === bestDist && index > bestIndex)) {
      bestDist = dist
      bestIndex = index
    }
  }

  return bestIndex
}

const mutationAffectsBlockObservers = (mutation: MutationRecord) => {
  if (mutation.type === "childList") {
    return [...mutation.addedNodes, ...mutation.removedNodes].some((node) => {
      if (!(node instanceof Element)) return false
      return (
        node.classList.contains("formio-component-panel") ||
        node.classList.contains("formio-component") ||
        !!node.querySelector?.(".formio-component-panel, .formio-component")
      )
    })
  }

  if (mutation.type === "attributes" && mutation.attributeName === "class") {
    const el = mutation.target as Element
    const oldValue = mutation.oldValue || ""
    // Collapse / conditional hide / panel redraws typically flip these classes.
    return (
      el.classList.contains("formio-component-panel") ||
      el.classList.contains("formio-hidden") ||
      oldValue.includes("formio-hidden") ||
      el.classList.contains("formio-collapsed") ||
      oldValue.includes("formio-collapsed") ||
      el.classList.contains("collapsed") ||
      oldValue.includes("collapsed")
    )
  }

  return false
}

export function useBlockScrollSpy({
  boxRef,
  formJson,
  blockClasses,
  visibilityVersion,
  setSelectedTabIndex,
  previousBlockLayoutsRef,
  captureBlockLayouts,
}: IUseBlockScrollSpyParams) {
  const isMounted = useMountStatus()
  const [domVersion, setDomVersion] = useState(0)
  const intersectingTargetsRef = useRef(new Set<Element>())
  const setSelectedTabIndexRef = useRef(setSelectedTabIndex)
  setSelectedTabIndexRef.current = setSelectedTabIndex

  // Re-bind observers when Form.io mutates the DOM (collapse/expand, conditionals, redraws).
  // Do not depend on click/focus — that was the flaky “wake up” path.
  useEffect(() => {
    if (!isMounted) return
    const box = boxRef.current
    if (!box) return

    let rafId = 0
    const scheduleRebind = () => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => setDomVersion((v) => v + 1))
    }

    const mutationObserver = new MutationObserver((mutations) => {
      if (mutations.some(mutationAffectsBlockObservers)) scheduleRebind()
    })

    mutationObserver.observe(box, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class"],
      attributeOldValue: true,
    })

    return () => {
      cancelAnimationFrame(rafId)
      mutationObserver.disconnect()
    }
  }, [isMounted, formJson])

  useEffect(() => {
    // Thin mid-viewport line; selected CONTENTS tab follows the intersecting visible block.
    if (!isMounted) return

    intersectingTargetsRef.current = new Set()
    const blockNodes = queryVisibleBlockNodes(blockClasses)
    const viewportHeight = window.innerHeight
    const midY = viewportHeight / 2
    const topValue = -midY + 5
    const bottomValue = -midY + 5
    const blockOptions = {
      rootMargin: `${topValue}px 0px ${bottomValue}px 0px`,
      threshold: 0.0001,
    }

    const handleBlockIntersection = (entries: IntersectionObserverEntry[]) => {
      for (const entry of entries) {
        if (entry.isIntersecting) intersectingTargetsRef.current.add(entry.target)
        else intersectingTargetsRef.current.delete(entry.target)
      }
      if (intersectingTargetsRef.current.size === 0) return

      const index = pickScrollSpyBlockIndex(intersectingTargetsRef.current, queryVisibleBlockNodes(blockClasses), midY)
      if (index >= 0) setSelectedTabIndexRef.current(index)
    }

    const blockObserver = new IntersectionObserver(handleBlockIntersection, blockOptions)
    blockNodes.forEach((node) => blockObserver.observe(node))

    previousBlockLayoutsRef.current = captureBlockLayouts()

    return () => {
      blockObserver.disconnect()
    }
  }, [formJson, isMounted, window.innerHeight, visibilityVersion, domVersion, blockClasses])
}
