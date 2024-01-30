import { Menu, MenuButton, MenuList } from "@chakra-ui/react"
import { Archive, ArrowsLeftRight, ClockClockwise } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { ISearch } from "../../../lib/create-search-model"
import { IUser } from "../../../models/user"
import { ManageMenuItem } from "../base/manage-menu-item"
import { RouterLink } from "../navigation/router-link"
import { Can } from "./can"

interface IManageUserMenuProps<TSearchModel extends ISearch> {
  user: IUser
  searchModel?: TSearchModel
}

export const ManageUserMenu = observer(function ManageUserMenu<TSearchModel extends ISearch>({
  user,
  searchModel,
}: IManageUserMenuProps<TSearchModel>) {
  const handleRemove = async () => {
    if (await user.destroy()) searchModel?.search()
  }

  const handleRestore = async () => {
    if (await user.restore()) searchModel?.search()
  }

  const { t } = useTranslation()
  return (
    <Can action="user:manage" data={{ user }}>
      <Menu>
        <MenuButton as={RouterLink}>{t("ui.manage")}</MenuButton>
        <MenuList>
          <ManageMenuItem icon={<ArrowsLeftRight />}>{t("user.changeRole")}</ManageMenuItem>
          {user.isDiscarded ? (
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
