import { Button, HStack, Input } from "@chakra-ui/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React from "react"
import { useForm } from "react-hook-form"
import { useNavigate, useParams } from "react-router-dom"
import { usePart9StepCode } from "../../../../hooks/resources/use-part-9-step-code"
import { useMst } from "../../../../setup/root"
import { EStepCodeChecklistStatus } from "../../../../types/enums"
import { RestartConfirmationModal } from "../part-9/restart-confirmation-modal"

export const Part9NavLinks = observer(function Part9StepCodeNavLinks() {
  const { currentStepCode } = usePart9StepCode()
  const checklist = currentStepCode?.preConstructionChecklist
  const navigate = useNavigate()
  const { permitApplicationId } = useParams()
  const { uiStore } = useMst()
  const { handleSubmit, register, formState } = useForm()
  const { isValid, isSubmitting } = formState

  const onComplete = async (values) => {
    const shouldRequestReportGeneration = !currentStepCode?.permitApplicationId
    await currentStepCode.updateChecklist(
      checklist.id,
      values,
      shouldRequestReportGeneration ? { reportGenerationRequested: true } : undefined
    )
  }

  const handleBack = () => {
    uiStore.setScrollToSelector(".formio-component[class*='energy_step_code_method']")
    if (permitApplicationId) {
      navigate(`/permit-applications/${permitApplicationId}/edit`)
    } else {
      navigate("/step-codes")
    }
  }

  const handleSave = async () => {
    //@ts-ignore
    document.stepCodeChecklistForm.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }))
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
          <Button variant="secondary" onClick={handleSave}>
            {t("stepCode.saveAndGoBack")}
          </Button>
          <form onSubmit={handleSubmit(onComplete)}>
            <Input type="hidden" value={EStepCodeChecklistStatus.complete} {...register("status")} />
            <Button
              variant="primary"
              isLoading={isSubmitting}
              isDisabled={checklist.isComplete || isSubmitting || !isValid}
              type="submit"
            >
              {t("stepCode.markAsComplete")}
            </Button>
          </form>
        </>
      ) : (
        <Button variant="primary" onClick={handleBack}>
          {t("stepCode.back")}
        </Button>
      )}
    </HStack>
  )
})
