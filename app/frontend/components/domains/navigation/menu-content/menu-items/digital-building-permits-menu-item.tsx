import { FileText } from "@phosphor-icons/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { MenuLinkItem } from "../menu-link-item"

export const DigitalBuildingPermitsMenuItem = () => {
  const { t } = useTranslation()

  return (
    <MenuLinkItem
      icon={<FileText size={20} />}
      label={t("site.breadcrumb.digitalBuildingPermits")}
      to="/digital-building-permits"
    />
  )
}
