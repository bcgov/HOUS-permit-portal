import { Button, Menu, MenuButton, MenuItem, MenuList, Tooltip, useDisclosure } from "@chakra-ui/react"
import { Archive, ClockClockwise, ClockCounterClockwise, Globe } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { IRequirementTemplate } from "../../../models/requirement-template"
import { useMst } from "../../../setup/root"
import { ConfirmationModal } from "../../shared/confirmation-modal"
import { TemplateAccessSidebar } from "./template-access-sidebar"
import { TemplateVersionsSidebar } from "./template-versions-sidebar"

interface RequirementTemplateActionsProps {
  requirementTemplate: IRequirementTemplate
}

export const RequirementTemplateActions = observer(function RequirementTemplateActions({
  requirementTemplate,
}: RequirementTemplateActionsProps) {
  const { t } = useTranslation()
  const { requirementTemplateStore } = useMst()
  const { isOpen: isVersionsOpen, onOpen: onVersionsOpen, onClose: onVersionsClose } = useDisclosure()
  const { isOpen: isAccessOpen, onOpen: onAccessOpen, onClose: onAccessClose } = useDisclosure()

  const handleArchive = async () => {
    if (await requirementTemplate.destroy()) await requirementTemplateStore.search()
  }

  const handleRestore = async () => {
    if (await requirementTemplate.restore()) await requirementTemplateStore.search()
  }

  return (
    <>
      <Menu>
        <MenuButton as={Button} aria-label="more options" variant="link">
          {t("ui.moreOptions")}
        </MenuButton>
        <MenuList>
          <MenuItem icon={<ClockCounterClockwise size={20} />} onClick={onVersionsOpen}>
            {t("requirementTemplate.versions", "Versions")}
          </MenuItem>
          <MenuItem icon={<Globe size={20} />} onClick={onAccessOpen}>
            {t("requirementTemplate.access.title", "Access")}
          </MenuItem>
          {requirementTemplate.isDiscarded ? (
            <ConfirmationModal
              title={t("ui.confirmRestore")}
              onConfirm={(closeModal) => {
                handleRestore()
                closeModal()
              }}
              renderTriggerButton={({ onClick }) => (
                <MenuItem icon={<ClockClockwise size={20} />} onClick={onClick} color="semantic.success">
                  {t("ui.restore")}
                </MenuItem>
              )}
              renderConfirmationButton={(props) => (
                <Button {...props} colorScheme="green">
                  {t("ui.restore")}
                </Button>
              )}
            />
          ) : requirementTemplate.publishedTemplateVersion ? (
            <Tooltip
              label={t("requirementTemplate.index.archiveDisabledPublished")}
              shouldWrapChildren
              hasArrow
              placement="left"
            >
              <MenuItem isDisabled icon={<Archive size={20} />} color="semantic.error">
                {t("ui.archive")}
              </MenuItem>
            </Tooltip>
          ) : (
            <ConfirmationModal
              title={t("requirementTemplate.index.archiveConfirmationModal.title")}
              body={t("requirementTemplate.index.archiveConfirmationModal.body")}
              onConfirm={(closeModal) => {
                handleArchive()
                closeModal()
              }}
              renderTriggerButton={({ onClick }) => (
                <MenuItem icon={<Archive size={20} />} onClick={onClick} color="semantic.error">
                  {t("ui.archive")}
                </MenuItem>
              )}
              renderConfirmationButton={(props) => (
                <Button {...props} colorScheme="red">
                  {t("ui.archive")}
                </Button>
              )}
            />
          )}
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
