import { Button, Flex, Link } from "@chakra-ui/react"
import { t } from "i18next"
import React from "react"
import { useNavigate } from "react-router-dom"

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
    isPermitLinked: boolean
    exitLinkPath: string
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
  const { navigateToNext, navigateToPrevious, hasNext, hasPrevious, infoPagePath, isPermitLinked, exitLinkPath } =
    navigation
  const isButtonDisabled = Boolean(isDisabled) || Boolean(isLoading)
  const isFinalStep = !hasNext
  const completeLabel = generatesReport ? "stepCode.markAsCompleteAndGenerateReport" : "stepCode.markAsComplete"
  const continueLabel = generatesReport ? completeLabel : ctaTranslationKey
  const finalLabel = generatesReport ? completeLabel : "stepCode.complete"

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
      if (isFinalStep) return navigate(infoPagePath)
      if (hasPrevious) return navigateToPrevious()
      return navigate(infoPagePath)
    })
  // Exit must stay available even when Complete is gated (e.g. report !canMarkComplete).
  const handleExit = () => {
    if (isDisabled) return navigate(exitLinkPath)
    return submitAndNavigate(() => navigate(exitLinkPath))
  }
  const exitLabel = isPermitLinked ? t("stepCode.goToPermitApplication") : t(goToStepCodesTranslationKey)

  return (
    <Flex direction="column" gap={3} pt={8} w="full">
      <Flex gap={3} w="full" align="center">
        <Button
          variant={hasNext ? "secondary" : "primary"}
          onClick={handleSaveAndGoBack}
          isDisabled={isButtonDisabled}
          isLoading={isFinalStep ? isLoading : undefined}
        >
          {t(hasNext ? "stepCode.saveAndGoBack" : finalLabel)}
        </Button>
        {hasNext && (
          <Button variant="primary" onClick={handleContinue} isDisabled={isButtonDisabled} isLoading={isLoading}>
            {t(continueLabel)}
          </Button>
        )}
        <Link ml="auto" onClick={handleExit} cursor="pointer">
          {exitLabel}
        </Link>
      </Flex>
    </Flex>
  )
}
