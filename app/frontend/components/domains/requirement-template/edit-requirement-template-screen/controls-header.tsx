import { Button, HStack } from "@chakra-ui/react"
import { CaretRight, Plus } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { IRequirementTemplate } from "../../../../models/requirement-template"
import { IRequirementTemplateForm } from "./index"

interface IProps {
  onPublish?: () => void
  onSaveDraft: () => void
  onAddSection: () => void
  requirementTemplate: IRequirementTemplate
}

export const ControlsHeader = observer(function ControlsHeader({
  requirementTemplate,
  onPublish,
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
  return (
    <HStack
      px={6}
      py={4}
      bg={"greys.grey03"}
      w={"full"}
      justifyContent={"space-between"}
      boxShadow={"elevations.elevation02"}
    >
      <Button variant={"secondary"} isDisabled={isSubmitting} leftIcon={<Plus />} onClick={onAddSection}>
        {t("requirementTemplate.edit.addSectionButton")}
      </Button>
      <HStack spacing={4}>
        <Button
          variant={"primary"}
          isDisabled={requirementTemplate.isPublished || isSubmitting || !isValid}
          isLoading={isSubmitting}
          onClick={onSaveDraft}
        >
          {t("requirementTemplate.edit.saveDraft")}
        </Button>
        <Button
          variant={"primary"}
          rightIcon={<CaretRight />}
          onClick={onPublish}
          isDisabled={isSubmitting || !isValid}
          isLoading={isSubmitting}
        >
          {t("ui.publish")}
        </Button>
        <Button variant={"secondary"} isDisabled={isSubmitting} onClick={onClose}>
          {t("requirementTemplate.edit.closeEditor")}
        </Button>
      </HStack>
    </HStack>
  )
})
