import { UserCircle } from "@phosphor-icons/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { MenuLinkItem } from "../menu-link-item"

export const MyProfileMenuItem = () => {
  const { t } = useTranslation()

  return <MenuLinkItem icon={<UserCircle size={20} />} label={t("user.myProfile")} to="/profile" />
}
