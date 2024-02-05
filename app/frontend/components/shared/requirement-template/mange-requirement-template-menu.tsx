import { Button, Menu, MenuButton, MenuList } from "@chakra-ui/react"
import { Archive, ClockClockwise } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { ISearch } from "../../../lib/create-search-model"
import { IRequirementTemplate } from "../../../models/requirement-template"
import { ManageMenuItem } from "../base/manage-menu-item"
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
            <ManageMenuItem color="semantic.success" onClick={handleRestore} icon={<ClockClockwise />}>
              {t("ui.restore")}
            </ManageMenuItem>
          ) : (
            <ManageMenuItem color="semantic.error" onClick={handleRemove} icon={<Archive />}>
              {t("ui.archive")}
            </ManageMenuItem>
          )}
        </MenuList>
      </Menu>
    </Can>
  )
})
