import { Button, Flex, Link, Text } from "@chakra-ui/react"
import { t } from "i18next"
import React from "react"
import { Link as RouterLink, useNavigate } from "react-router-dom"

export interface IStepCodeFormFooterProps<T> {
  handleSubmit: (onValid: (data: T) => void | Promise<void>, onInvalid?: () => void) => (e?: any) => void
  onSubmit: (data: T) => Promise<void>
  isLoading?: boolean
  isDisabled?: boolean
  generatesReport?: boolean
  ctaTranslationKey: "stepCode.part3.cta" | "stepCode.part9.cta"
  goToStepCodesTranslationKey: "stepCode.part3.goToStepCodes" | "stepCode.part9.goToStepCodes"
  navigation: {
    navigateToNext: () => void
    navigateToPrevious: () => void
    hasNext: boolean
    hasPrevious: boolean
    goBackPath: string
    infoPagePath: string
  }
}

export function StepCodeFormFooter<T>({
  handleSubmit,
  onSubmit,
  isLoading,
  isDisabled,
  generatesReport,
  ctaTranslationKey,
  goToStepCodesTranslationKey,
  navigation,
}: IStepCodeFormFooterProps<T>) {
  const navigate = useNavigate()
  const { navigateToNext, navigateToPrevious, hasNext, hasPrevious, goBackPath, infoPagePath } = navigation
  const isButtonDisabled = isDisabled ?? isLoading
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
  const handleSaveAndGoBack = () =>
    submitAndNavigate(() => {
      if (isFinalStep) return navigate(goBackPath)
      if (hasPrevious) return navigateToPrevious()
      return navigate(infoPagePath)
    })

  return (
    <Flex direction="column" gap={3} pt={8} w="full">
      <Flex gap={3} w="full" align="center">
        <Button
          variant={hasNext ? "secondary" : "primary"}
          onClick={handleSaveAndGoBack}
          isDisabled={isButtonDisabled}
          isLoading={isFinalStep ? isLoading : undefined}
        >
          {t(hasNext ? "stepCode.saveAndGoBack" : completeLabel)}
        </Button>
        {hasNext && (
          <Button variant="primary" onClick={handleContinue} isDisabled={isButtonDisabled} isLoading={isLoading}>
            {t(ctaTranslationKey)}
          </Button>
        )}
        <Link as={RouterLink} to="/step-codes?currentPage=1" ml="auto">
          {t(goToStepCodesTranslationKey)}
        </Link>
      </Flex>
      {generatesReport && isFinalStep && (
        <Text fontSize="sm" color="text.secondary">
          {t("stepCode.reportGenerationHint")}
        </Text>
      )}
    </Flex>
  )
}
