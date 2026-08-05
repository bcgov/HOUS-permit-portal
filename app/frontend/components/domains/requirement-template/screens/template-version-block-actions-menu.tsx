import { Button, Menu, MenuButton, MenuItem, MenuList, Text } from "@chakra-ui/react"
import { CaretDown } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { Link as RouterLink } from "react-router-dom"
import { useMst } from "../../../../setup/root"
import { ConfirmationModal } from "../../../shared/modals/confirmation-modal"

interface IProps {
  templateVersionId: string
  requirementTemplateId: string
  requirementBlockId: string
}

export const TemplateVersionBlockActionsMenu = observer(function TemplateVersionBlockActionsMenu({
  templateVersionId,
  requirementTemplateId,
  requirementBlockId,
}: IProps) {
  const { t } = useTranslation()
  const { requirementTemplateStore } = useMst()
  const [isRestoring, setIsRestoring] = useState(false)

  const editPath = `/requirement-templates/${requirementTemplateId}/edit?openRequirementBlockId=${requirementBlockId}`

  const handleRestore = async () => {
    setIsRestoring(true)
    try {
      await requirementTemplateStore.restoreRequirementBlockFromVersion(templateVersionId, requirementBlockId)
    } finally {
      setIsRestoring(false)
    }
  }

  return (
    <Menu>
      <MenuButton
        as={Button}
        variant="link"
        color="text.primary"
        textDecoration="none"
        _hover={{ textDecoration: "underline" }}
        rightIcon={<CaretDown />}
        onClick={(e) => e.stopPropagation()}
        isLoading={isRestoring}
      >
        {t("templateVersionPreview.blockActions.menuLabel")}
      </MenuButton>
      <MenuList onClick={(e) => e.stopPropagation()}>
        <MenuItem as={RouterLink} to={editPath} target="_blank" rel="noopener noreferrer">
          {t("templateVersionPreview.openInBuilder")}
        </MenuItem>
        <ConfirmationModal
          promptHeader={t("templateVersionPreview.blockActions.restoreConfirmTitle")}
          promptMessage={
            <Text whiteSpace="pre-line">{t("templateVersionPreview.blockActions.restoreConfirmBody")}</Text>
          }
          confirmText={t("templateVersionPreview.blockActions.restoreConfirmButton")}
          onConfirm={handleRestore}
          renderTrigger={(onOpen) => (
            <MenuItem onClick={onOpen}>{t("templateVersionPreview.blockActions.restoreSourceBlock")}</MenuItem>
          )}
        />
      </MenuList>
    </Menu>
  )
})
