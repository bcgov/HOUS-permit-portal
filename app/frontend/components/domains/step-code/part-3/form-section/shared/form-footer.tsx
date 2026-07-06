import { Button, Flex, Text } from "@chakra-ui/react"
import { t } from "i18next"
import React from "react"
import { useNavigate } from "react-router-dom"
import { usePart3Navigation } from "../../use-part-3-navigation"

interface IPart3FormFooterProps<T> {
  handleSubmit: (onValid: (data: T) => void | Promise<void>, onInvalid?: () => void) => (e?: any) => void
  onSubmit: (data: T) => Promise<void>
  isLoading?: boolean
  generatesReport?: boolean
}

export function Part3FormFooter<T>({ handleSubmit, onSubmit, isLoading, generatesReport }: IPart3FormFooterProps<T>) {
  const navigate = useNavigate()
  const { navigateToNext, hasNext, goBackPath } = usePart3Navigation()
  const isFinalStep = !hasNext
  const completeLabel =
    generatesReport && isFinalStep ? "stepCode.markAsCompleteAndGenerateReport" : "stepCode.markAsComplete"

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
    <Flex direction="column" gap={3} pt={8} w="full">
      <Flex gap={3}>
        <Button
          variant={hasNext ? "secondary" : "primary"}
          onClick={handleSaveAndGoBack}
          isDisabled={isLoading}
          isLoading={isFinalStep ? isLoading : undefined}
        >
          {t(hasNext ? "stepCode.saveAndGoBack" : completeLabel)}
        </Button>
        {hasNext && (
          <Button variant="primary" onClick={handleContinue} isDisabled={isLoading} isLoading={isLoading}>
            {t("stepCode.part3.cta")}
          </Button>
        )}
      </Flex>
      {generatesReport && isFinalStep && (
        <Text fontSize="sm" color="text.secondary">
          {t("stepCode.reportGenerationHint")}
        </Text>
      )}
    </Flex>
  )
}
