import { Bookmark } from "@phosphor-icons/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { MenuLinkItem } from "../menu-link-item"

export const RequirementsLibraryMenuItem = () => {
  const { t } = useTranslation()

  return (
    <MenuLinkItem icon={<Bookmark size={20} />} label={t("home.requirementsLibraryTitle")} to="/requirements-library" />
  )
}
