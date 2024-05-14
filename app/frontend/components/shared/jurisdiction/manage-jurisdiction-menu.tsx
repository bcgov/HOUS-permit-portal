import { Button, Menu, MenuButton, MenuList } from "@chakra-ui/react"
import { Info, Users } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { ISearch } from "../../../lib/create-search-model"
import { IJurisdiction } from "../../../models/jurisdiction"
import { ManageMenuItem } from "../base/manage-menu-item"
import { Can } from "../user/can"

interface IManageJurisdictionMenuProps<TSearchModel extends ISearch> {
  jurisdiction: IJurisdiction
  searchModel?: TSearchModel
}

export const ManageJurisdictionMenu = observer(function ManageJurisdictionMenu<TSearchModel extends ISearch>({
  jurisdiction,
  searchModel,
}: IManageJurisdictionMenuProps<TSearchModel>) {
  const { t } = useTranslation()
  return (
    <Can action="jurisdiction:manage" data={{ jurisdiction }}>
      <Menu>
        <MenuButton as={Button} variant="link">
          {t("ui.manage")}
        </MenuButton>
        <MenuList boxShadow="elevations.elevation04">
          <ManageMenuItem icon={<Info size={16} />} to={`${jurisdiction.slug}`}>
            {t("jurisdiction.index.about")}
          </ManageMenuItem>
          <ManageMenuItem icon={<Users size={16} />} to={`${jurisdiction.slug}/users`}>
            {t("jurisdiction.index.users")}
          </ManageMenuItem>
        </MenuList>
      </Menu>
    </Can>
  )
})
