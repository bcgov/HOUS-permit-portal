import { Button, HStack } from "@chakra-ui/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React from "react"
import { useNavigate } from "react-router-dom"
import { useMst } from "../../../setup/root"
import { RestartConfirmationModal } from "./restart-confirmation-modal"

export const StepCodeNavLinks = observer(function StepCodeNavLinks() {
  const { stepCodeStore } = useMst()
  const navigate = useNavigate()

  const handleDeleteStepCode = async () => {
    await stepCodeStore.deleteStepCode()
  }

  const handleSave = async () => {
    document.stepCodeChecklistForm.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }))
  }

  return (
    <HStack>
      {/* TODO: digitize step code checklist guide */}
      {/* <Button variant="tertiary" rightIcon={<ArrowSquareOut />}>
        {t("stepCode.checklistGuide")}
      </Button> */}

      {stepCodeStore.currentStepCode ? (
        <>
          <Button variant="primary" onClick={handleSave}>
            {t("stepCode.saveAndGoBack")}
          </Button>
          <RestartConfirmationModal />
        </>
      ) : (
        <Button variant="primary" onClick={() => navigate(-1)}>
          {t("stepCode.back")}
        </Button>
      )}
    </HStack>
  )
})
