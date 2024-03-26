import { Button, HStack } from "@chakra-ui/react"
import { Plus } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { IRequirementTemplate } from "../../../../../models/requirement-template"
import { IRequirementTemplateForm } from "./index"
import { PublishScheduleModal } from "./publish-schedule-modal"

interface IProps {
  onScheduleDate?: (date: Date) => void
  onSaveDraft: () => void
  onAddSection: () => void
  requirementTemplate: IRequirementTemplate
}

export const ControlsHeader = observer(function ControlsHeader({
  requirementTemplate,
  onScheduleDate,
  onSaveDraft,
  onAddSection,
}: IProps) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const {
    formState: { isSubmitting, isValid },
  } = useFormContext<IRequirementTemplateForm>()
  const onClose = () => {
    window.history.state && window.history.state.idx > 0 ? navigate(-1) : navigate(`/requirement-templates`)
  }
  const isSubmitDisabled = !!requirementTemplate.discardedAt || isSubmitting || !isValid

  return (
    <HStack
      position="sticky"
      zIndex="1"
      left="0"
      right="0"
      top="0"
      px={6}
      py={4}
      bg={"greys.grey03"}
      w="calc(100vw - 368px - 15px)"
      justifyContent={"space-between"}
      boxShadow={"elevations.elevation02"}
    >
      <Button variant={"secondary"} isDisabled={isSubmitting} leftIcon={<Plus />} onClick={onAddSection}>
        {t("requirementTemplate.edit.addSectionButton")}
      </Button>
      <HStack spacing={4}>
        <Button variant={"primary"} isDisabled={isSubmitDisabled} isLoading={isSubmitting} onClick={onSaveDraft}>
          {t("requirementTemplate.edit.saveDraft")}
        </Button>
        <PublishScheduleModal
          minDate={requirementTemplate.nextAvailableScheduleDate}
          onScheduleConfirm={onScheduleDate}
          triggerButtonProps={{
            isDisabled: isSubmitDisabled,
          }}
        />

        <Button variant={"secondary"} isDisabled={isSubmitting} onClick={onClose}>
          {t("requirementTemplate.edit.closeEditor")}
        </Button>
      </HStack>
    </HStack>
  )
})
