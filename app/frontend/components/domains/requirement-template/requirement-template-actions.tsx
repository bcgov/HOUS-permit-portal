import { Button, Menu, Portal, useDisclosure } from "@chakra-ui/react"
import { ClockCounterClockwise, Globe } from "@phosphor-icons/react"
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
  const { open: isVersionsOpen, onOpen: onVersionsOpen, onClose: onVersionsClose } = useDisclosure()
  const { open: isAccessOpen, onOpen: onAccessOpen, onClose: onAccessClose } = useDisclosure()

  return (
    <>
      <Menu.Root>
        <Menu.Trigger asChild>
          <Button aria-label="more options" variant="link">
            {t("ui.moreOptions")}
          </Button>
        </Menu.Trigger>
        <Portal>
          <Menu.Positioner>
            <Menu.Content>
              <Menu.Item icon={<ClockCounterClockwise size={20} />} onSelect={onVersionsOpen} value="item-0">
                {t("requirementTemplate.versions", "Versions")}
              </Menu.Item>
              <Menu.Item icon={<Globe size={20} />} onSelect={onAccessOpen} value="item-1">
                {t("requirementTemplate.access.title", "Access")}
              </Menu.Item>
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Menu.Root>
      <TemplateVersionsSidebar
        requirementTemplate={requirementTemplate}
        open={isVersionsOpen}
        onClose={onVersionsClose}
      />
      <TemplateAccessSidebar requirementTemplate={requirementTemplate} open={isAccessOpen} onClose={onAccessClose} />
    </>
  )
})
