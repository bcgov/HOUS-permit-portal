import { Button, HStack } from "@chakra-ui/react"
import { t } from "i18next"
import React from "react"
import { useParams } from "react-router-dom"
import { usePart3StepCode } from "../../../../hooks/resources/use-part-3-step-code"

export const Part3NavLinks = function Part3StepCodeNavLinks() {
  const { checklist } = usePart3StepCode()
  const { permitApplicationId } = useParams()

  const handleSave = async () => {
    if (!checklist) return

    const formName = "part3SectionForm"
    const formElement = document.forms[formName]

    const editPath = permitApplicationId ? `/permit-applications/${permitApplicationId}/edit` : "/step-codes"
    checklist.setAlternateNavigateAfterSavePath(editPath)

    if (formElement) {
      //@ts-ignore
      formElement.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }))
    } else {
      console.warn(`Part 3 Save: Could not find form with name '${formName}'`)
      // Reset the path if the form wasn't found, as the save won't happen
      checklist.setAlternateNavigateAfterSavePath(null)
    }
  }

  return (
    <HStack>
      {/* TODO: digitize step code checklist guide */}
      {/* <Button variant="tertiary" rightIcon={<ArrowSquareOut />}>
        {t("stepCode.checklistGuide")}
      </Button> */}

      <Button variant="secondary" onClick={handleSave}>
        {t("stepCode.saveAndGoBack")}
      </Button>
    </HStack>
  )
}
