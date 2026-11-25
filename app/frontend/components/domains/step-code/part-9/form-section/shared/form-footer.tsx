import React from "react"
import { StepCodeFormFooter } from "../../../form-section/shared/form-footer"
import { usePart9Navigation } from "../../use-part-9-navigation"

interface IPart9FormFooterProps<T> {
  handleSubmit: (onValid: (data: T) => void | Promise<void>, onInvalid?: () => void) => (e?: any) => void
  onSubmit: (data: T) => Promise<void>
  isLoading?: boolean
  isDisabled?: boolean
  generatesReport?: boolean
}

export function Part9FormFooter<T>({
  handleSubmit,
  onSubmit,
  isLoading,
  isDisabled,
  generatesReport,
}: IPart9FormFooterProps<T>) {
  const navigation = usePart9Navigation()

  return (
    <StepCodeFormFooter
      handleSubmit={handleSubmit}
      onSubmit={onSubmit}
      isLoading={isLoading}
      isDisabled={isDisabled}
      generatesReport={generatesReport}
      navigation={navigation}
    />
  )
}
