import { Button, Flex } from "@chakra-ui/react"
import { t } from "i18next"
import React from "react"
import { useNavigate } from "react-router-dom"
import { usePart9Navigation } from "../../use-part-9-navigation"

interface IPart9FormFooterProps<T> {
  handleSubmit: (onValid: (data: T) => void | Promise<void>, onInvalid?: () => void) => (e?: any) => void
  onSubmit: (data: T) => Promise<void>
  isLoading?: boolean
  isDisabled?: boolean
}

export function Part9FormFooter<T>({ handleSubmit, onSubmit, isLoading, isDisabled }: IPart9FormFooterProps<T>) {
  const navigate = useNavigate()
  const { navigateToNext, hasNext, goBackPath } = usePart9Navigation()
  const isButtonDisabled = isDisabled ?? isLoading

  const submitAndNavigate = async (navigateFn: () => void) => {
    try {
      await new Promise<void>((resolve, reject) => {
        handleSubmit(
          async (data) => {
            try {
              await onSubmit(data)
              resolve()
            } catch (error) {
              reject(error)
            }
          },
          () => reject(new Error("Validation failed"))
        )()
      })
      navigateFn()
    } catch {
      // validation or submission error — don't navigate
    }
  }

  const handleContinue = () => submitAndNavigate(navigateToNext)
  const handleSaveAndGoBack = () => submitAndNavigate(() => navigate(goBackPath))

  return (
    <Flex gap={3} pt={8}>
      <Button variant="secondary" onClick={handleSaveAndGoBack} isDisabled={isButtonDisabled}>
        {t("stepCode.saveAndGoBack")}
      </Button>
      {hasNext && (
        <Button variant="primary" onClick={handleContinue} isDisabled={isButtonDisabled} isLoading={isLoading}>
          {t("stepCode.part9.cta")}
        </Button>
      )}
    </Flex>
  )
}
