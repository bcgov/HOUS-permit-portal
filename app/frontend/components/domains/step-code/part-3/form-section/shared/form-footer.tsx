import React from "react"
import { StepCodeFormFooter } from "../../../form-section/shared/form-footer"
import { usePart3Navigation } from "../../use-part-3-navigation"

interface IPart3FormFooterProps<T> {
  handleSubmit: (onValid: (data: T) => void | Promise<void>, onInvalid?: () => void) => (e?: any) => void
  onSubmit: (data: T) => Promise<void>
  isLoading?: boolean
  generatesReport?: boolean
}

export function Part3FormFooter<T>({ handleSubmit, onSubmit, isLoading, generatesReport }: IPart3FormFooterProps<T>) {
  const navigation = usePart3Navigation()

  return (
    <StepCodeFormFooter
      handleSubmit={handleSubmit}
      onSubmit={onSubmit}
      isLoading={isLoading}
      generatesReport={generatesReport}
      ctaTranslationKey="stepCode.part3.cta"
      goToStepCodesTranslationKey="stepCode.part3.goToStepCodes"
      navigation={navigation}
    />
  )
}
