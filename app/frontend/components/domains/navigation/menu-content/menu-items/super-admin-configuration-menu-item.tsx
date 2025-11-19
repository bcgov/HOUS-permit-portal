import { Gear } from "@phosphor-icons/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { MenuLinkItem } from "../menu-link-item"

export const SuperAdminConfigurationMenuItem = () => {
  const { t } = useTranslation()

  return (
    <MenuLinkItem
      icon={<Gear size={20} />}
      label={t("home.configurationManagement.title")}
      to="/configuration-management"
    />
  )
}
