import { Button, Flex } from "@chakra-ui/react"
import { CaretLeft, CaretRight } from "@phosphor-icons/react"
import { t } from "i18next"
import React from "react"
import { useNavigate } from "react-router-dom"

export interface IStepCodeFormFooterProps<T> {
  handleSubmit: (onValid: (data: T) => void | Promise<void>, onInvalid?: () => void) => (e?: any) => void
  onSubmit: (data: T) => Promise<void>
  isLoading?: boolean
  isDisabled?: boolean
  generatesReport?: boolean
  navigation: {
    navigateToNext: () => void
    navigateToPrevious: () => void
    hasNext: boolean
    hasPrevious: boolean
    infoPagePath: string
  }
}

export function StepCodeFormFooter<T>({
  handleSubmit,
  onSubmit,
  isLoading,
  isDisabled,
  generatesReport,
  navigation,
}: IStepCodeFormFooterProps<T>) {
  const navigate = useNavigate()
  const { navigateToNext, navigateToPrevious, hasNext, hasPrevious, infoPagePath } = navigation
  const isButtonDisabled = Boolean(isDisabled) || Boolean(isLoading)
  const isFinalStep = !hasNext
  const completeLabel = generatesReport ? "stepCode.markAsCompleteAndGenerateReport" : "stepCode.markAsComplete"
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
      if (isFinalStep) return navigate("/step-codes?currentPage=1")
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
          leftIcon={hasNext ? <CaretLeft size={16} /> : undefined}
        >
          {t(hasNext ? "ui.back" : finalLabel)}
        </Button>
        {hasNext && (
          <Button
            variant="primary"
            onClick={handleContinue}
            isDisabled={isButtonDisabled}
            isLoading={isLoading}
            rightIcon={generatesReport ? undefined : <CaretRight size={16} />}
          >
            {t(generatesReport ? completeLabel : "ui.continue")}
          </Button>
        )}
      </Flex>
    </Flex>
  )
}
