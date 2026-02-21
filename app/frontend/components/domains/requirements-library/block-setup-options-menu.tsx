import { Button, Divider, Menu, MenuButton, MenuList } from "@chakra-ui/react"
import { Archive, CaretDown, ClockClockwise, Copy } from "@phosphor-icons/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React, { useState } from "react"
import { IRequirementBlock } from "../../../models/requirement-block"
import { useMst } from "../../../setup/root"
import { ManageMenuItemButton } from "../../shared/base/manage-menu-item"
import { SharedSpinner } from "../../shared/base/shared-spinner"
import { ConfirmationModal } from "../../shared/confirmation-modal"

interface IBlockSetupOptionsMenuProps {
  requirementBlock: IRequirementBlock
}

export const BlockSetupOptionsMenu = observer(function BlockSetupOptionsMenu({
  requirementBlock,
}: IBlockSetupOptionsMenuProps) {
  const forEarlyAccess = requirementBlock.isEarlyAccess
  const { requirementBlockStore, earlyAccessRequirementBlockStore } = useMst()
  const searchModel = forEarlyAccess ? earlyAccessRequirementBlockStore : requirementBlockStore
  const [isLoading, setIsLoading] = useState(false)

  const handleRemove = async () => {
    if (await requirementBlock.destroy()) searchModel?.search()
  }

  const handleRestore = async () => {
    if (await requirementBlock.restore()) searchModel?.search()
  }

  const handleCopy = async () => {
    setIsLoading(true)
    if (await requirementBlockStore.copyRequirementBlock(requirementBlock)) {
      searchModel?.search()
      setIsLoading(false)
    }
  }

  return (
    <Menu>
      {isLoading ? (
        <SharedSpinner />
      ) : (
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
      )}

      <MenuList>
        <ManageMenuItemButton onClick={handleCopy} leftIcon={<Copy size={16} />}>
          {t("requirementsLibrary.modals.edit.copy")}
        </ManageMenuItemButton>
        <Divider color="border.light" />
        {requirementBlock.isDiscarded ? (
          <ConfirmationModal
            title={t("ui.confirmRestore")}
            onConfirm={(closeModal) => {
              handleRestore()
              closeModal()
            }}
            renderTriggerButton={(props) => (
              <ManageMenuItemButton color="semantic.success" leftIcon={<ClockClockwise size={16} />} {...props}>
                {t("ui.restore")}
              </ManageMenuItemButton>
            )}
            renderConfirmationButton={(props) => (
              <Button {...props} colorScheme="green">
                {t("ui.restore")}
              </Button>
            )}
          />
        ) : (
          <ConfirmationModal
            title={t("requirementsLibrary.modals.edit.removeConfirmationModal.title")}
            body={t("requirementsLibrary.modals.edit.removeConfirmationModal.body")}
            onConfirm={(closeModal) => {
              handleRemove()
              closeModal()
            }}
            renderTriggerButton={(props) => (
              <ManageMenuItemButton color="semantic.error" leftIcon={<Archive size={16} />} {...props}>
                {t("ui.archive")}
              </ManageMenuItemButton>
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
  )
})
