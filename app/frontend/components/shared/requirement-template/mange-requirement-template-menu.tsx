import { Button, Menu, MenuButton, MenuList } from "@chakra-ui/react"
import { Archive, ClockClockwise } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { ISearch } from "../../../lib/create-search-model"
import { IRequirementTemplate } from "../../../models/requirement-template"
import { ConfirmationModal } from "../../confirmation-modal"
import { ManageMenuItemButton } from "../base/manage-menu-item"
import { Can } from "../user/can"

interface IManageRequirementTemplateMenuProps<TSearchModel extends ISearch> {
  requirementTemplate: IRequirementTemplate
  searchModel?: TSearchModel
}

export const ManageRequirementTemplateMenu = observer(function ManageRequirementTemplateMenu<
  TSearchModel extends ISearch,
>({ requirementTemplate, searchModel }: IManageRequirementTemplateMenuProps<TSearchModel>) {
  const handleRemove = async () => {
    if (await requirementTemplate.destroy()) searchModel?.search()
  }

  const handleRestore = async () => {
    if (await requirementTemplate.restore()) searchModel?.search()
  }

  const { t } = useTranslation()
  return (
    <Can action="requirementTemplate:manage" data={{ requirementTemplate }}>
      <Menu>
        <MenuButton as={Button} variant="link">
          {t("ui.manage")}
        </MenuButton>
        <MenuList>
          {requirementTemplate.isDiscarded ? (
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
              title={t("ui.confirmArchive")}
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
    </Can>
  )
})
