import { MutableRefObject, useEffect, useState } from "react"
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
  const [wrapperClickCount, setWrapperClickCount] = useState(0)

  useEffect(() => {
    // Observers need to be re-registered whenever a panel is collapsed.
    // FormIO prevents bubbling, so listen on the wrapper directly.
    const box = boxRef.current
    const handleClick = () => {
      setWrapperClickCount((n) => n + 1)
    }
    box?.addEventListener("click", handleClick)
    return () => {
      box?.removeEventListener("click", handleClick)
    }
  }, [])

  useEffect(() => {
    // Thin mid-viewport line; selected CONTENTS tab follows the intersecting visible block.
    if (!isMounted) return

    const formComponentNodes = document.querySelectorAll(".formio-component")
    const blockNodes = Array.from(formComponentNodes).filter(
      (node) =>
        !node.classList.contains("formio-hidden") &&
        Array.from(node.classList).some((className) => blockClasses.includes(className))
    )
    const viewportHeight = window.innerHeight
    const topValue = -viewportHeight / 2 + 5
    const bottomValue = -viewportHeight / 2 + 5
    const rootMarginValue = `${topValue}px 0px ${bottomValue}px 0px`
    const blockOptions = {
      rootMargin: rootMarginValue,
      threshold: 0.0001,
    }

    const handleBlockIntersection = (entries: IntersectionObserverEntry[]) => {
      const entry = entries.filter((en) => en.isIntersecting)[0]
      if (!entry) return

      const visibleBlockNodes = Array.from(document.querySelectorAll(".formio-component")).filter(
        (node) =>
          !node.classList.contains("formio-hidden") &&
          Array.from(node.classList).some((className) => blockClasses.includes(className))
      )
      const index = visibleBlockNodes.indexOf(entry.target)
      if (index >= 0) setSelectedTabIndex(index)
    }

    const blockObserver = new IntersectionObserver(handleBlockIntersection, blockOptions)
    blockNodes.forEach((ref) => {
      if (ref) blockObserver.observe(ref)
    })

    previousBlockLayoutsRef.current = captureBlockLayouts()

    return () => {
      blockObserver.disconnect()
    }
  }, [formJson, isMounted, window.innerHeight, wrapperClickCount, visibilityVersion])
}
