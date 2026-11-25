import { MutableRefObject, useEffect, useRef, useState } from "react"
import {
  getCompletedBlocksFromForm,
  reconcileSelectedTabIndex,
  scrollAdjustmentForHiddenBlocks,
} from "../../../../../utils/formio-component-traversal"

type BlockLayout = { key: string; absTop: number; height: number }

interface IUseChecklistVisibilityParams {
  formRef: MutableRefObject<any>
  blockClasses: string[]
  selectedTabIndex: number
  setSelectedTabIndex: (index: number) => void
  isStepCodeComplete: boolean
  onCompletedBlocksChange?: (sections: Record<string, boolean>) => void
}

export function useChecklistVisibility({
  formRef,
  blockClasses,
  selectedTabIndex,
  setSelectedTabIndex,
  isStepCodeComplete,
  onCompletedBlocksChange,
}: IUseChecklistVisibilityParams) {
  const stepCodeCompletionOptions = { isStepCodeComplete }
  const previousVisibleBlockKeysRef = useRef<string[]>([])
  const previousCompletedBlocksRef = useRef<Record<string, boolean>>({})
  const previousBlockLayoutsRef = useRef<BlockLayout[]>([])
  const [visibilityVersion, setVisibilityVersion] = useState(0)

  const captureBlockLayouts = () =>
    blockClasses.flatMap((className) => {
      const el = document.getElementsByClassName(className)[0] as HTMLElement | undefined
      if (!el || el.classList.contains("formio-hidden")) return []
      const rect = el.getBoundingClientRect()
      return [
        {
          key: className.replace(/^formio-component-/, ""),
          absTop: rect.top + window.scrollY,
          height: rect.height,
        },
      ]
    })

  const syncCompletedBlocksFromForm = (root) => {
    if (!root || !onCompletedBlocksChange) return

    const previousKeys = previousVisibleBlockKeysRef.current
    const nextCompleted = getCompletedBlocksFromForm(root, stepCodeCompletionOptions)
    const nextKeys = Object.keys(nextCompleted)
    const keysChanged = previousKeys.length !== nextKeys.length || previousKeys.some((key, i) => key !== nextKeys[i])
    const completionChanged =
      keysChanged || nextKeys.some((key) => previousCompletedBlocksRef.current[key] !== nextCompleted[key])

    if (keysChanged && previousKeys.length > 0) {
      const hiddenKeys = new Set(previousKeys.filter((key) => !nextKeys.includes(key)))
      // Bonus: counteract layout collapse when a tall block above the viewport hides.
      if (hiddenKeys.size > 0) {
        const adjustment = scrollAdjustmentForHiddenBlocks(previousBlockLayoutsRef.current, hiddenKeys, window.scrollY)
        if (adjustment > 0) window.scrollBy(0, -adjustment)
      }

      const nextIndex = reconcileSelectedTabIndex(previousKeys, nextKeys, selectedTabIndex)
      if (nextIndex !== selectedTabIndex) setSelectedTabIndex(nextIndex)
    }

    previousVisibleBlockKeysRef.current = nextKeys
    if (completionChanged) {
      previousCompletedBlocksRef.current = nextCompleted
      onCompletedBlocksChange(nextCompleted)
    }
    if (keysChanged) {
      requestAnimationFrame(() => {
        previousBlockLayoutsRef.current = captureBlockLayouts()
      })
      setVisibilityVersion((v) => v + 1)
    }
  }

  const syncCompletedBlocksFromFormRef = useRef(syncCompletedBlocksFromForm)
  syncCompletedBlocksFromFormRef.current = syncCompletedBlocksFromForm

  // Recompute block completion when the digital Step Code checklist completion flips
  useEffect(() => {
    if (formRef.current) syncCompletedBlocksFromFormRef.current(formRef.current)
  }, [isStepCodeComplete])

  return {
    visibilityVersion,
    syncCompletedBlocksFromForm,
    syncCompletedBlocksFromFormRef,
    previousBlockLayoutsRef,
    captureBlockLayouts,
  }
}
