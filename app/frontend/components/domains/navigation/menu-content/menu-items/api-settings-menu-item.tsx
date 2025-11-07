import { ChartBar } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../../../setup/root"
import { MenuLinkItem } from "../menu-link-item"

export const ApiSettingsMenuItem = observer(() => {
  const { t } = useTranslation()
  const { userStore } = useMst()
  const { currentUser } = userStore

  return (
    <MenuLinkItem
      icon={<ChartBar size={20} />}
      label={t("site.breadcrumb.apiSettings")}
      to={`/jurisdictions/${currentUser?.jurisdiction?.slug}/api-settings`}
    />
  )
})
