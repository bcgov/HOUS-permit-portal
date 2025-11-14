import { House } from "@phosphor-icons/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { MenuLinkItem } from "../menu-link-item"

export const HomeMenuItem = () => {
  const { t } = useTranslation()

  return <MenuLinkItem icon={<House size={20} />} label={t("site.home")} to="/" />
}
