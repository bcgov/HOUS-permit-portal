import { Button, Menu, MenuButton, MenuList } from "@chakra-ui/react"
import { Archive, ArrowsLeftRight, ClockClockwise } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { ISearch } from "../../../lib/create-search-model"
import { IUser } from "../../../models/user"
import { useMst } from "../../../setup/root"
import { ManageMenuItem } from "../base/manage-menu-item"
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

  const {
    jurisdictionStore: { currentJurisdiction },
    userStore: { currentUser },
  } = useMst()

  const isCurrentUser = user.id === currentUser.id

  return (
    <Can action="jurisdiction:manage" data={{ jurisdiction: currentJurisdiction }}>
      <Menu>
        <MenuButton as={Button} variant="link">
          {t("ui.manage")}
        </MenuButton>
        <MenuList>
          <ManageMenuItem icon={<ArrowsLeftRight />}>{t("user.changeRole")}</ManageMenuItem>
          {user.isDiscarded ? (
            <ManageMenuItem color="semantic.success" onClick={handleRestore} icon={<ClockClockwise />}>
              {t("ui.restore")}
            </ManageMenuItem>
          ) : (
            <ManageMenuItem
              color={isCurrentUser ? "greys.grey01" : "semantic.error"}
              onClick={handleRemove}
              icon={<Archive />}
              isDisabled={isCurrentUser}
            >
              {t("ui.archive")}
            </ManageMenuItem>
          )}
        </MenuList>
      </Menu>
    </Can>
  )
})
