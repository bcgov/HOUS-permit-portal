import { Buildings } from "@phosphor-icons/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { MenuLinkItem } from "../menu-link-item"

export const MyProjectsMenuItem = () => {
  const { t } = useTranslation()

  return <MenuLinkItem icon={<Buildings size={20} />} label={t("site.myProjects")} to="/projects" />
}
