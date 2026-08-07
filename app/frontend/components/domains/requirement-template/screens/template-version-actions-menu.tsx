import { Button, Menu, MenuButton, MenuItem, MenuList, Text } from "@chakra-ui/react"
import { CaretDown } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { IRequirementTemplate } from "../../../../models/requirement-template"
import { ITemplateVersion } from "../../../../models/template-version"
import { useMst } from "../../../../setup/root"
import { ConfirmationModal } from "../../../shared/confirmation-modal"
import { ConfirmationModal as PromptConfirmationModal } from "../../../shared/modals/confirmation-modal"
import { PublishScheduleModal } from "../publish-schedule-modal"

interface IProps {
  templateVersion: ITemplateVersion
  requirementTemplate?: IRequirementTemplate
  showSchedulePublish: boolean
  showDiscard: boolean
  scheduledConflicts: Array<{ id: string; versionDate: Date }>
  onScheduleConfirm: (scheduleDate: Date) => Promise<void>
  onForcePublishNow?: () => Promise<void>
  onSaveAndValidate: () => Promise<any[]>
}

export const TemplateVersionActionsMenu = observer(function TemplateVersionActionsMenu({
  templateVersion,
  requirementTemplate,
  showSchedulePublish,
  showDiscard,
  scheduledConflicts,
  onScheduleConfirm,
  onForcePublishNow,
  onSaveAndValidate,
}: IProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { requirementTemplateStore } = useMst()
  const [isDiscardingDraft, setIsDiscardingDraft] = useState(false)
  const [isRestoringLayout, setIsRestoringLayout] = useState(false)

  const requirementTemplateId = templateVersion.requirementTemplateId

  const handleDiscardDraft = async (closeModal: () => void) => {
    if (!requirementTemplateId) return
    setIsDiscardingDraft(true)
    try {
      const updated = await requirementTemplateStore.discardDraft(templateVersion.id)
      if (updated) {
        closeModal()
        navigate(`/requirement-templates/${requirementTemplateId}/edit`)
      }
    } finally {
      setIsDiscardingDraft(false)
    }
  }

  const handleRestoreLayout = async () => {
    if (!requirementTemplateId) return
    setIsRestoringLayout(true)
    try {
      const updated = await requirementTemplateStore.restoreLayout(templateVersion.id)
      if (updated) {
        navigate(`/requirement-templates/${requirementTemplateId}/edit`)
      }
    } finally {
      setIsRestoringLayout(false)
    }
  }

  return (
    <Menu>
      <MenuButton
        as={Button}
        variant="secondary"
        rightIcon={<CaretDown />}
        isLoading={isRestoringLayout || isDiscardingDraft}
      >
        {t("templateVersionPreview.actions.menuLabel")}
      </MenuButton>
      <MenuList>
        {showSchedulePublish && requirementTemplate && (
          <PublishScheduleModal
            requirementTemplate={requirementTemplate}
            minDate={requirementTemplate.nextAvailableScheduleDate}
            scheduledConflicts={scheduledConflicts}
            onScheduleConfirm={onScheduleConfirm}
            onForcePublishNow={onForcePublishNow}
            onSaveAndValidate={onSaveAndValidate}
            translationNamespace="templateVersionPreview.schedulePublish"
            triggerLabel={t("templateVersionPreview.schedulePublish.triggerButton")}
            hideManageAccessButton
            renderTrigger={(onOpen) => (
              <MenuItem onClick={onOpen}>{t("templateVersionPreview.schedulePublish.triggerButton")}</MenuItem>
            )}
          />
        )}
        {requirementTemplateId && (
          <PromptConfirmationModal
            promptHeader={t("templateVersionPreview.restoreLayout.confirmTitle")}
            promptMessage={<Text whiteSpace="pre-line">{t("templateVersionPreview.restoreLayout.confirmBody")}</Text>}
            confirmText={t("templateVersionPreview.restoreLayout.confirmButton")}
            confirmButtonBg="semantic.error"
            onConfirm={handleRestoreLayout}
            renderTrigger={(onOpen) => (
              <MenuItem onClick={onOpen}>{t("templateVersionPreview.restoreLayout.triggerButton")}</MenuItem>
            )}
          />
        )}
        {showDiscard && (
          <ConfirmationModal
            title={t("templateVersionPreview.discardDraft.title")}
            body={t("templateVersionPreview.discardDraft.body")}
            onConfirm={handleDiscardDraft}
            renderTriggerButton={(props) => (
              <MenuItem {...props} color="semantic.error">
                {t("templateVersionPreview.discardDraft.triggerButton")}
              </MenuItem>
            )}
            renderConfirmationButton={(props) => (
              <Button {...props} colorScheme="red" isLoading={isDiscardingDraft}>
                {t("templateVersionPreview.discardDraft.confirmButton")}
              </Button>
            )}
          />
        )}
      </MenuList>
    </Menu>
  )
})
