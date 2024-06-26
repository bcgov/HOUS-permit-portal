import { Button, Menu, MenuButton, MenuList } from "@chakra-ui/react"
import { Archive, ArrowsLeftRight, ClockClockwise, PaperPlaneTilt } from "@phosphor-icons/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React from "react"
import { useForm } from "react-hook-form"
import { ISearch } from "../../../lib/create-search-model"
import { IUser } from "../../../models/user"
import { useMst } from "../../../setup/root"
import { EUserRoles } from "../../../types/enums"
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
          {user.role != EUserRoles.superAdmin && (
            <Can action="user:updateRole">
              <ManageMenuItemButton
                color={isCurrentUser ? "greys.grey01" : "text.primary"}
                leftIcon={<ArrowsLeftRight />}
                onClick={handleChangeRole}
                isDisabled={isCurrentUser}
              >
                {t("user.changeRole")}
              </ManageMenuItemButton>
            </Can>
          )}
          {(user.isUnconfirmed || user.isDiscarded) && <ReinviteUserForm user={user} />}
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

interface IFormProps {
  user: IUser
}
const ReinviteUserForm = function ReinviteUserForm({ user }: IFormProps) {
  const { handleSubmit, formState } = useForm()
  const { isSubmitting } = formState

  const onSubmit = async () => await user.reinvite()

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <ManageMenuItemButton
        color="text.primary"
        type="submit"
        leftIcon={<PaperPlaneTilt size={16} />}
        isLoading={isSubmitting}
        isDisabled={isSubmitting}
      >
        {t("user.reinvite")}
      </ManageMenuItemButton>
    </form>
  )
}
