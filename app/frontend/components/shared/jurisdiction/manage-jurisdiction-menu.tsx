import { Button, Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/react"
import { Info, Users } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { ISearch } from "../../../lib/create-search-model"
import { IJurisdiction } from "../../../models/jurisdiction"
import { RouterLinkButton } from "../navigation/router-link-button"
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
        <MenuList>
          <MenuItem
            as={RouterLinkButton}
            leftIcon={<Info />}
            w="full"
            justifyContent="flex-start"
            to={`${jurisdiction.id}`}
          >
            {t("jurisdiction.index.about")}
          </MenuItem>
          <MenuItem
            as={RouterLinkButton}
            leftIcon={<Users />}
            w="full"
            justifyContent="flex-start"
            to={`${jurisdiction.id}/users`}
          >
            {t("jurisdiction.index.users")}
          </MenuItem>
        </MenuList>
      </Menu>
    </Can>
  )
})
