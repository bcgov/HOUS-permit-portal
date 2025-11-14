import { FileText } from "@phosphor-icons/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { MenuLinkItem } from "../menu-link-item"

export const PermitTemplateCatalogueMenuItem = () => {
  const { t } = useTranslation()

  return (
    <MenuLinkItem
      icon={<FileText size={20} />}
      label={t("home.permitTemplateCatalogueTitle")}
      to="/requirement-templates"
    />
  )
}
