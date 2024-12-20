import { Button, HStack } from "@chakra-ui/react"
import { t } from "i18next"
import React from "react"

export const Part3NavLinks = function Part3StepCodeNavLinks() {
  return (
    <HStack>
      {/* TODO: digitize step code checklist guide */}
      {/* <Button variant="tertiary" rightIcon={<ArrowSquareOut />}>
        {t("stepCode.checklistGuide")}
      </Button> */}

      <Button variant="secondary">{t("stepCode.saveAndGoBack")}</Button>
      <Button variant="primary" type="submit">
        {t("stepCode.markAsComplete")}
      </Button>
    </HStack>
  )
}
