import { Megaphone } from "@phosphor-icons/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { MenuLinkItem } from "../menu-link-item"

export const GiveFeedbackMenuItem = () => {
  const { t } = useTranslation()

  return (
    <MenuLinkItem
      icon={<Megaphone size={20} />}
      label={t("site.giveFeedback")}
      onClick={() => {
        window.location.href = `mailto:${t("site.contactEmail")}`
      }}
    />
  )
}
