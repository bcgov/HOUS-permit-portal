import { ChartBar } from "@phosphor-icons/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { MenuLinkItem } from "../menu-link-item"

export const ReportingMenuItem = () => {
  const { t } = useTranslation()

  return <MenuLinkItem icon={<ChartBar size={20} />} label={t("home.reportingTitle")} to="/reporting" />
}
