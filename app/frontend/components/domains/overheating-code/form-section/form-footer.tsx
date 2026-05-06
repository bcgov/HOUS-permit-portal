import { Button, Flex } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { useOverheatingCodeNavigation } from "../use-overheating-code-navigation"

interface IFormFooterProps<T = void> {
  handleSubmit?: (onValid: (data: T) => void | Promise<void>, onInvalid?: () => void) => (e?: any) => void
  onSubmit?: (data: T) => Promise<void> | void
  isLoading?: boolean
  loading?: boolean
}

export const FormFooter = observer(function FormFooter<T>({
  handleSubmit,
  onSubmit,
  isLoading,
  loading,
}: IFormFooterProps<T>) {
  const { t } = useTranslation()
  const { navigateToNext, hasNext } = useOverheatingCodeNavigation()

  const hasSaveLogic = handleSubmit && onSubmit

  const handleContinue = async () => {
    if (!hasSaveLogic) {
      return navigateToNext()
    }

    try {
      await new Promise<void>((resolve, reject) => {
        handleSubmit(
          async (data) => {
            try {
              await onSubmit(data)
              resolve()
            } catch (err) {
              reject(err)
            }
          },
          () => {
            reject(new Error("Validation failed"))
          }
        )()
      })

      navigateToNext()
    } catch (error) {
      console.error("Form validation failed or submission error:", error)
    }
  }

  return (
    <Flex gap={3} mt={8} justifyContent="flex-start">
      <Button variant="primary" onClick={handleContinue} disabled={!hasNext} loading={loading ?? isLoading}>
        {hasSaveLogic ? t("ui.saveAndcontinue", "Save and Continue") : t("ui.next", "Next")}
      </Button>
    </Flex>
  )
})
