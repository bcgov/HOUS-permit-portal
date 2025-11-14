import { Gear } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../../../setup/root"
import { MenuLinkItem } from "../menu-link-item"

export const ConfigurationManagementMenuItem = observer(() => {
  const { t } = useTranslation()
  const { userStore } = useMst()
  const { currentUser } = userStore

  return (
    <MenuLinkItem
      icon={<Gear size={20} />}
      label={t("site.breadcrumb.configurationManagement")}
      to={`/jurisdictions/${currentUser?.jurisdiction?.slug}/configuration-management`}
    />
  )
})
