import { Button, HStack, Input } from "@chakra-ui/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React from "react"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { useMst } from "../../../setup/root"
import { EStepCodeChecklistStatus } from "../../../types/enums"
import { RestartConfirmationModal } from "./restart-confirmation-modal"

export const StepCodeNavLinks = observer(function StepCodeNavLinks() {
  const { stepCodeStore } = useMst()
  const { currentStepCode } = stepCodeStore
  const checklist = currentStepCode?.preConstructionChecklist
  const navigate = useNavigate()
  const { handleSubmit, register, formState } = useForm()
  const { isValid, isSubmitting } = formState

  const onComplete = async (values) => {
    await currentStepCode.updateStepCodeChecklist(checklist.id, values)
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

      {stepCodeStore.currentStepCode ? (
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
        <Button variant="primary" onClick={() => navigate(-1)}>
          {t("stepCode.back")}
        </Button>
      )}
    </HStack>
  )
})
