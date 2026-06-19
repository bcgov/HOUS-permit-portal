import { Button, HStack } from "@chakra-ui/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React from "react"
import { useNavigate } from "react-router-dom"
import { usePart9StepCode } from "../../../../hooks/resources/use-part-9-step-code"
import { useMst } from "../../../../setup/root"
import { RestartConfirmationModal } from "../part-9/restart-confirmation-modal"

export const Part9NavLinks = observer(function Part9StepCodeNavLinks() {
  const { currentStepCode } = usePart9StepCode()
  const checklist = currentStepCode?.currentChecklist
  const navigate = useNavigate()
  const { uiStore } = useMst()

  const handleBack = () => {
    uiStore.setScrollToSelector(".formio-component[class*='energy_step_code_method']")
    navigate(-1)
  }

  return (
    <HStack>
      {/* TODO: digitize step code checklist guide */}
      {/* <Button variant="tertiary" rightIcon={<ArrowSquareOut />}>
        {t("stepCode.checklistGuide")}
      </Button> */}

      {checklist ? (
        <>
          <RestartConfirmationModal />
          <Button variant="secondary" onClick={handleBack}>
            {t("stepCode.back")}
          </Button>
        </>
      ) : (
        <Button variant="primary" onClick={handleBack}>
          {t("stepCode.back")}
        </Button>
      )}
    </HStack>
  )
})
