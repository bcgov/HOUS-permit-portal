import { Button } from "@chakra-ui/react"
import { t } from "i18next"
import React from "react"
import { usePart3Navigation } from "../../use-part-3-navigation"

interface IPart3FormFooterProps {
  isSubmitting?: boolean
}

export function Part3FormFooter({ isSubmitting }: IPart3FormFooterProps) {
  const { hasNext } = usePart3Navigation()

  return (
    <Button type="submit" variant="primary" isLoading={isSubmitting} isDisabled={isSubmitting || !hasNext}>
      {t("stepCode.part3.cta")}
    </Button>
  )
}
