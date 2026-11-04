import { Megaphone } from "@phosphor-icons/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { feedbackController } from "../../../../../services/observability"
import { MenuLinkItem, useMenuClose } from "../menu-link-item"

export const GiveFeedbackMenuItem = () => {
  const { t } = useTranslation()
  const closeMenu = useMenuClose()

  return (
    <MenuLinkItem
      icon={<Megaphone size={20} />}
      label={t("site.giveFeedback")}
      onClick={() => {
        if (feedbackController.enabled) void feedbackController.open("drawer")
        else {
          closeMenu?.()
          window.location.href = `mailto:${t("site.contactEmail")}`
        }
      }}
    />
  )
}
