import { Button, Menu, MenuButton, MenuList } from "@chakra-ui/react"
import { Archive, ArrowsLeftRight, ClockClockwise, PaperPlaneTilt } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { ISearch } from "../../../lib/create-search-model"
import { IUser } from "../../../models/user"
import { useMst } from "../../../setup/root"
import { ManageMenuItemButton } from "../base/manage-menu-item"
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

  const handleChangeRole = async () => {
    if (await user.changeRole()) searchModel?.search()
  }

  const handleReinvite = async () => {
    navigate(`invite?userId=${user.id}`)
  }

  const { t } = useTranslation()
  const navigate = useNavigate()

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
          <ManageMenuItemButton
            color={isCurrentUser ? "greys.grey01" : "text.primary"}
            leftIcon={<ArrowsLeftRight />}
            onClick={handleChangeRole}
            isDisabled={isCurrentUser}
          >
            {t("user.changeRole")}
          </ManageMenuItemButton>
          {(user.isUnconfirmed || user.isDiscarded) && (
            <ManageMenuItemButton color="text.primary" onClick={handleReinvite} leftIcon={<PaperPlaneTilt size={16} />}>
              {t("user.reinvite")}
            </ManageMenuItemButton>
          )}
          {user.isDiscarded ? (
            <ManageMenuItemButton
              color="semantic.success"
              onClick={handleRestore}
              leftIcon={<ClockClockwise size={16} />}
            >
              {t("ui.restore")}
            </ManageMenuItemButton>
          ) : (
            <ManageMenuItemButton
              color={isCurrentUser ? "greys.grey01" : "semantic.error"}
              onClick={handleRemove}
              leftIcon={<Archive size={16} />}
              isDisabled={isCurrentUser}
            >
              {t("ui.archive")}
            </ManageMenuItemButton>
          )}
        </MenuList>
      </Menu>
    </Can>
  )
})
