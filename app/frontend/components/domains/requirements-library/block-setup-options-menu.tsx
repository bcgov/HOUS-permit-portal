import { Button, Divider, Menu, MenuButton, MenuList } from "@chakra-ui/react"
import { Archive, CaretDown, ClockClockwise, Copy } from "@phosphor-icons/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React from "react"
import { IRequirementBlock } from "../../../models/requirement-block"
import { useMst } from "../../../setup/root"
import { ManageMenuItemButton } from "../../shared/base/manage-menu-item"
import { RemoveConfirmationModal } from "../../shared/modals/remove-confirmation-modal"

interface IBlockSetupOptionsMenuProps {
  requirementBlock: IRequirementBlock
}

export const BlockSetupOptionsMenu = observer(function BlockSetupOptionsMenu({
  requirementBlock,
}: IBlockSetupOptionsMenuProps) {
  const { requirementBlockStore } = useMst()

  const handleRemove = async () => {
    if (await requirementBlock.destroy()) requirementBlockStore?.search()
  }

  const handleRestore = async () => {
    if (await requirementBlock.restore()) requirementBlockStore?.search()
  }

  const handleCopy = async () => {
    if (await requirementBlockStore.copyRequirementBlock(requirementBlock)) requirementBlockStore?.search()
  }

  return (
    <Menu>
      <MenuButton
        as={Button}
        variant="link"
        color={"text.primary"}
        textDecoration={"none"}
        _hover={{
          textDecoration: "underline",
        }}
        rightIcon={<CaretDown />}
        h={6}
      >
        {t("requirementsLibrary.modals.edit.options")}
      </MenuButton>

      <MenuList>
        <ManageMenuItemButton onClick={handleCopy} leftIcon={<Copy size={16} />}>
          {t("requirementsLibrary.modals.edit.copy")}
        </ManageMenuItemButton>
        <Divider color="border.light" />
        {requirementBlock.isDiscarded ? (
          <ManageMenuItemButton
            color="semantic.success"
            onClick={handleRestore}
            leftIcon={<ClockClockwise size={16} />}
          >
            {t("ui.restore")}
          </ManageMenuItemButton>
        ) : (
          <RemoveConfirmationModal
            title={t("requirementsLibrary.modals.edit.removeConfirmationModal.title")}
            body={t("requirementsLibrary.modals.edit.removeConfirmationModal.body")}
            onRemove={async (closeModal) => {
              await handleRemove()
              closeModal()
            }}
            renderTriggerButton={({ onClick }) => (
              <ManageMenuItemButton color={"semantic.error"} onClick={onClick} leftIcon={<Archive size={16} />}>
                {t("ui.archive")}
              </ManageMenuItemButton>
            )}
          />
        )}
      </MenuList>
    </Menu>
  )
})
