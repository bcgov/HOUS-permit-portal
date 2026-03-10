import { Button, HStack } from "@chakra-ui/react"
import { t } from "i18next"
import React from "react"

export const Part3NavLinks = function Part3StepCodeNavLinks() {
  const handleSave = async () => {
    const formName = "part3SectionForm"
    const formElement = document.forms[formName]

    if (formElement) {
      formElement.dispatchEvent(
        new CustomEvent("submit", { cancelable: true, bubbles: true, detail: { saveAndGoBack: true } })
      )
    } else {
      console.warn(`Part 3 Save: Could not find form with name '${formName}'`)
    }
  }

  return (
    <HStack>
      <Button variant="secondary" onClick={handleSave}>
        {t("stepCode.saveAndGoBack")}
      </Button>
    </HStack>
  )
}
