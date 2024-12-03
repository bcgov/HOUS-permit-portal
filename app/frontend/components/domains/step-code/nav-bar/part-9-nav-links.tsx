import { Button, HStack, Input } from "@chakra-ui/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React from "react"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { usePart9StepCode } from "../../../../hooks/resources/use-part-9-step-code"
import { EStepCodeChecklistStatus } from "../../../../types/enums"
import { RestartConfirmationModal } from "../part-9/restart-confirmation-modal"

export const Part9NavLinks = observer(function Part9StepCodeNavLinks() {
  const { stepCode } = usePart9StepCode()
  const checklist = stepCode?.preConstructionChecklist
  const navigate = useNavigate()
  const { handleSubmit, register, formState } = useForm()
  const { isValid, isSubmitting } = formState

  const onComplete = async (values) => {
    await stepCode.updateChecklist(checklist.id, values)
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
        <Button variant="primary" onClick={() => navigate(-1)}>
          {t("stepCode.back")}
        </Button>
      )}
    </HStack>
  )
})
