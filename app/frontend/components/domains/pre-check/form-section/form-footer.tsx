import { Button, Flex } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { usePreCheckNavigation } from "../use-pre-check-navigation"

interface IFormFooterProps {
  onContinue?: () => Promise<void> | void
  isLoading?: boolean
}

export const FormFooter = observer(function FormFooter({ onContinue, isLoading }: IFormFooterProps) {
  const { t } = useTranslation()
  const { navigateToNext, navigateToPrevious, hasNext, hasPrevious } = usePreCheckNavigation()

  const handleContinue = async () => {
    try {
      if (onContinue) {
        await onContinue()
      }
      navigateToNext()
    } catch (error) {
      console.error("Form submission failed:", error)
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
