import { Button, Menu, MenuButton, MenuItem, MenuList, useDisclosure } from "@chakra-ui/react"
import { CaretDown, ClockCounterClockwise } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { CreateEarlyAccessVersionModal } from "../../create-early-access-version-modal"
import { PublishScheduleModal } from "../../publish-schedule-modal"
import { TemplateAccessSidebar } from "../../template-access-sidebar"
import { TemplateVersionsSidebar } from "../../template-versions-sidebar"
import {
  BaseEditRequirementTemplateScreen,
  IEditRequirementActionsProps,
} from "../base-edit-requirement-template-screen"

export interface IEditRequirementTemplateScreenRenderActionProps extends Partial<IEditRequirementActionsProps> {}

export const EditRequirementTemplateScreen = observer(function EditRequirementTemplateScreen() {
  return (
    <BaseEditRequirementTemplateScreen
      renderActions={({ onCreateDraft, ...publishScheduleProps }) => (
        <EditRequirementTemplateActions onCreateDraft={onCreateDraft} {...publishScheduleProps} />
      )}
    />
  )
})

const EditRequirementTemplateActions = observer(function EditRequirementTemplateActions({
  onCreateDraft,
  ...publishScheduleProps
}: IEditRequirementActionsProps) {
  const { t } = useTranslation()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isOpen: isVersionsOpen, onOpen: onVersionsOpen, onClose: onVersionsClose } = useDisclosure()

  return (
    <>
      <Button variant="secondary" leftIcon={<ClockCounterClockwise size={20} />} onClick={onVersionsOpen}>
        {t("requirementTemplate.versions", "Versions")}
      </Button>
      <Button variant="secondary" onClick={onOpen}>
        {t("requirementTemplate.access.title", "Manage access")}
      </Button>
      {publishScheduleProps.requirementTemplate && (
        <>
          <TemplateVersionsSidebar
            requirementTemplate={publishScheduleProps.requirementTemplate}
            isOpen={isVersionsOpen}
            onClose={onVersionsClose}
            isInBuilder
          />
          <TemplateAccessSidebar
            requirementTemplate={publishScheduleProps.requirementTemplate}
            isOpen={isOpen}
            onClose={onClose}
          />
        </>
      )}
      <Menu>
        <MenuButton
          as={Button}
          variant={"primary"}
          rightIcon={<CaretDown />}
          {...publishScheduleProps.triggerButtonProps}
        >
          {t("requirementTemplate.edit.createVersion")}
        </MenuButton>
        <MenuList>
          {onCreateDraft && (
            <CreateEarlyAccessVersionModal
              onCreateEarlyAccessVersion={onCreateDraft}
              renderTrigger={(onOpen) => <MenuItem onClick={onOpen}>{t("requirementTemplate.status.draft")}</MenuItem>}
            />
          )}
          <PublishScheduleModal
            {...publishScheduleProps}
            hideManageAccessButton
            renderTrigger={(onOpen) => (
              <MenuItem onClick={onOpen}>{t("requirementTemplate.versionSidebar.listTitles.scheduled")}</MenuItem>
            )}
          />
        </MenuList>
      </Menu>
    </>
  )
})
