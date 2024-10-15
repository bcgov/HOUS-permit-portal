import { Button, HStack } from "@chakra-ui/react"
import { Plus } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { IRequirementTemplate } from "../../../../../models/requirement-template"
import { BrowserSearchPrompt } from "../../../../shared/permit-applications/browser-search-prompt"
import { IEditRequirementActionsProps, IEditRequirementOptionsProps, IRequirementTemplateForm } from "./index"

interface IProps {
  onScheduleDate?: (date: Date) => void
  onForcePublishNow?: () => void
  onSaveDraft: () => void
  onAddSection: () => void
  requirementTemplate: IRequirementTemplate
  hasStepCodeDependencyError?: boolean
  renderOptionsMenu?: React.FC<IEditRequirementOptionsProps>
  renderActions?: React.FC<IEditRequirementActionsProps>
}

export const ControlsHeader = observer(function ControlsHeader({
  requirementTemplate,
  onScheduleDate,
  onSaveDraft,
  onAddSection,
  onForcePublishNow,
  hasStepCodeDependencyError,
  renderOptionsMenu,
  renderActions,
}: IProps) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const {
    formState: { isSubmitting, isValid },
  } = useFormContext<IRequirementTemplateForm>()
  const onClose = () => {
    const parentPath = location.pathname.split("/").slice(0, -2).join("/") || "/"
    window.history.state && window.history.state.idx > 0 ? navigate(-1) : navigate(parentPath)
  }
  const isSubmitDisabled = hasStepCodeDependencyError || !!requirementTemplate.discardedAt || isSubmitting || !isValid

  return (
    <HStack
      position="sticky"
      zIndex="1"
      left="0"
      right="0"
      top="0"
      px="6"
      py="4"
      bg="greys.grey03"
      w="full"
      h="var(--app-permit-grey-controlbar-height)"
      justifyContent="space-between"
      boxShadow="elevations.elevation02"
    >
      <HStack spacing={4}>
        <Button variant={"secondary"} isDisabled={isSubmitting} leftIcon={<Plus />} onClick={onAddSection}>
          {t("requirementTemplate.edit.addSectionButton")}
        </Button>
        {renderOptionsMenu && renderOptionsMenu({ requirementTemplate })}
      </HStack>

      <HStack spacing={4}>
        <BrowserSearchPrompt color="text.primary" />

        {renderActions &&
          renderActions({
            requirementTemplate,
            minDate: requirementTemplate.nextAvailableScheduleDate,
            onScheduleConfirm: onScheduleDate,
            onForcePublishNow: onForcePublishNow,
            triggerButtonProps: {
              isDisabled: isSubmitDisabled,
            },
          })}
        <Button variant={"secondary"} isDisabled={isSubmitDisabled} isLoading={isSubmitting} onClick={onSaveDraft}>
          {t("requirementTemplate.edit.saveDraft")}
        </Button>

        <Button variant={"secondary"} isDisabled={isSubmitting} onClick={onClose}>
          {t("requirementTemplate.edit.closeEditor")}
        </Button>
      </HStack>
    </HStack>
  )
})
