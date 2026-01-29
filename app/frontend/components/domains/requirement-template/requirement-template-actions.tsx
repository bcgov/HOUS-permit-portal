import { Button, Menu, MenuButton, MenuItem, MenuList, useDisclosure } from "@chakra-ui/react"
import { CaretDown, ClockCounterClockwise, Globe } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { IRequirementTemplate } from "../../../models/requirement-template"
import { TemplateAccessSidebar } from "./template-access-sidebar"
import { TemplateVersionsSidebar } from "./template-versions-sidebar"

interface RequirementTemplateActionsProps {
  requirementTemplate: IRequirementTemplate
}

export const RequirementTemplateActions = observer(function RequirementTemplateActions({
  requirementTemplate,
}: RequirementTemplateActionsProps) {
  const { t } = useTranslation()
  const { isOpen: isVersionsOpen, onOpen: onVersionsOpen, onClose: onVersionsClose } = useDisclosure()
  const { isOpen: isAccessOpen, onOpen: onAccessOpen, onClose: onAccessClose } = useDisclosure()

  return (
    <>
      <Menu>
        <MenuButton as={Button} size="sm" rightIcon={<CaretDown weight="bold" />} variant="primary">
          {t("ui.manage")}
        </MenuButton>
        <MenuList>
          <MenuItem icon={<ClockCounterClockwise size={20} />} onClick={onVersionsOpen}>
            {t("requirementTemplate.versions", "Versions")}
          </MenuItem>
          <MenuItem icon={<Globe size={20} />} onClick={onAccessOpen}>
            {t("requirementTemplate.access.title", "Access")}
          </MenuItem>
        </MenuList>
      </Menu>

      <TemplateVersionsSidebar
        requirementTemplate={requirementTemplate}
        isOpen={isVersionsOpen}
        onClose={onVersionsClose}
      />

      <TemplateAccessSidebar requirementTemplate={requirementTemplate} isOpen={isAccessOpen} onClose={onAccessClose} />
    </>
  )
})
