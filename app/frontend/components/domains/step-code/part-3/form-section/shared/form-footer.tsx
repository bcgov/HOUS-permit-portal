import { Button, Flex, Link } from "@chakra-ui/react"
import { t } from "i18next"
import React from "react"
import { Link as RouterLink, useNavigate } from "react-router-dom"
import { usePart3Navigation } from "../../use-part-3-navigation"

interface IPart3FormFooterProps<T> {
  handleSubmit: (onValid: (data: T) => void | Promise<void>, onInvalid?: () => void) => (e?: any) => void
  onSubmit: (data: T) => Promise<void>
  isLoading?: boolean
}

export function Part3FormFooter<T>({ handleSubmit, onSubmit, isLoading }: IPart3FormFooterProps<T>) {
  const navigate = useNavigate()
  const { navigateToNext, navigateToPrevious, hasNext, hasPrevious, goBackPath, infoPagePath } = usePart3Navigation()

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
      if (!hasNext) return navigate(goBackPath)
      if (hasPrevious) return navigateToPrevious()
      return navigate(infoPagePath)
    })

  return (
    <Flex gap={3} pt={8} w="full" align="center">
      <Flex gap={3}>
        <Button
          variant={hasNext ? "secondary" : "primary"}
          onClick={handleSaveAndGoBack}
          isDisabled={isLoading}
          isLoading={!hasNext ? isLoading : undefined}
        >
          {t(hasNext ? "stepCode.saveAndGoBack" : "stepCode.markAsComplete")}
        </Button>
        {hasNext && (
          <Button variant="primary" onClick={handleContinue} isDisabled={isLoading} isLoading={isLoading}>
            {t("stepCode.part3.cta")}
          </Button>
        )}
      </Flex>
      <Link as={RouterLink} to="/step-codes?currentPage=1" ml="auto">
        {t("stepCode.part3.goToStepCodes")}
      </Link>
    </Flex>
  )
}
