import { ArrowSquareOut } from "@phosphor-icons/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { MenuLinkItem } from "../menu-link-item"

export const EarlyAccessMenuItem = () => {
  const { t } = useTranslation()

  return <MenuLinkItem icon={<ArrowSquareOut size={20} />} label={t("home.earlyAccess.title")} to="/early-access" />
}
