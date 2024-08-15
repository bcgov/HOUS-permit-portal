import { Button, Menu, MenuButton, MenuList } from "@chakra-ui/react"
import { Archive, CaretDown, ClockClockwise } from "@phosphor-icons/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React from "react"
import { ISearch } from "../../../lib/create-search-model"
import { IRequirementBlock } from "../../../models/requirement-block"
import { ManageMenuItemButton } from "../../shared/base/manage-menu-item"
import { RemoveConfirmationModal } from "../../shared/modals/remove-confirmation-modal"

interface IProps<TSearchModel extends ISearch> {
  requirementBlock: IRequirementBlock
  searchModel?: TSearchModel
}

export const BlockSetupOptionsMenu = observer(function BlockSetupOptionsMenu<TSearchModel extends ISearch>({
  requirementBlock,
  searchModel,
}: IProps<TSearchModel>) {
  const handleRemove = async () => {
    if (await requirementBlock.destroy()) searchModel?.search()
  }

  const handleRestore = async () => {
    if (await requirementBlock.restore()) searchModel?.search()
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
