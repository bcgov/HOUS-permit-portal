import { Button, Flex } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { usePreCheckNavigation } from "../use-pre-check-navigation"

interface IFormFooterProps<T> {
  handleSubmit: (onValid: (data: T) => void | Promise<void>, onInvalid?: () => void) => (e?: any) => void
  onSubmit: (data: T) => Promise<void> | void
  isLoading?: boolean
}

export const FormFooter = observer(function FormFooter<T>({ handleSubmit, onSubmit, isLoading }: IFormFooterProps<T>) {
  const { t } = useTranslation()
  const { navigateToNext, navigateToPrevious, hasNext, hasPrevious } = usePreCheckNavigation()

  const handleContinue = async () => {
    try {
      await new Promise<void>((resolve, reject) => {
        handleSubmit(
          async (data) => {
            await onSubmit(data)
            resolve()
          },
          () => {
            reject(new Error("Validation failed"))
          }
        )()
      })

      // Only navigate if valid
      navigateToNext()
    } catch (error) {
      console.warn("Form validation failed or submission error:", error)
    }
  }

  return (
    <Flex gap={3} mt={8} justifyContent="flex-start">
      <Button variant="primary" onClick={handleContinue} isDisabled={!hasNext} isLoading={isLoading}>
        {t("ui.continue", "Continue")}
      </Button>
      <Button variant="secondary" onClick={navigateToPrevious} isDisabled={!hasPrevious || isLoading}>
        {t("ui.back", "Back")}
      </Button>
    </Flex>
  )
})
