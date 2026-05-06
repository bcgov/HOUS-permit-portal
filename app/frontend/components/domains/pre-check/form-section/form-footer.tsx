import { Tooltip } from "@/components/ui/tooltip"
import { Button, Flex } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { usePreCheck } from "../../../../hooks/resources/use-pre-check"
import { usePreCheckNavigation } from "../use-pre-check-navigation"

interface IFormFooterProps<T> {
  handleSubmit?: (onValid: (data: T) => void | Promise<void>, onInvalid?: () => void) => (e?: any) => void
  onSubmit?: (data: T) => Promise<void> | void
  isLoading?: boolean
  loading?: boolean
  isDisabled?: boolean
  disabled?: boolean
  disabledMessage?: string
}

export const FormFooter = observer(function FormFooter<T>({
  handleSubmit,
  onSubmit,
  isLoading,
  loading,
  isDisabled,
  disabled,
  disabledMessage,
}: IFormFooterProps<T>) {
  const { t } = useTranslation()
  const { currentPreCheck } = usePreCheck()
  const { navigateToNext, hasNext } = usePreCheckNavigation()

  const handleContinue = async () => {
    if (currentPreCheck?.isSubmitted) return navigateToNext()

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

  const button = (
    <Button
      variant="primary"
      onClick={handleContinue}
      disabled={!hasNext || (disabled ?? isDisabled)}
      loading={loading ?? isLoading}
    >
      {currentPreCheck?.isSubmitted ? t("ui.next", "Next") : t("ui.saveAndcontinue", "Save and Continue")}
    </Button>
  )

  return (
    <Flex gap={3} mt={8} justifyContent="flex-start">
      {disabledMessage && (disabled ?? isDisabled) ? (
        <Tooltip
          content={disabledMessage}
          showArrow
          positioning={{
            placement: "top",
          }}
        >
          {button}
        </Tooltip>
      ) : (
        button
      )}
    </Flex>
  )
})
