import { Star } from "@phosphor-icons/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { MenuLinkItem } from "../menu-link-item"

export const WelcomeMenuItem = () => {
  const { t } = useTranslation()

  return <MenuLinkItem icon={<Star size={20} />} label={t("site.welcome")} to="/welcome" />
}
