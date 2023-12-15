import { RefObject, useEffect } from "react"

export type TUseQuickSubmitProps = {
  onSubmit: () => void
  formRef: RefObject<any>
  isDisabled: boolean
}

export function useQuickSubmit({ isDisabled, formRef, onSubmit }: TUseQuickSubmitProps) {
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  })

  const handleKeyDown = (e) => {
    const isFocused = formRef.current?.contains(document.activeElement)
    if (e.keyCode === 13 && (e.metaKey || e.cntrlKey) && !isDisabled && isFocused) {
      onSubmit()
    }
  }
}
