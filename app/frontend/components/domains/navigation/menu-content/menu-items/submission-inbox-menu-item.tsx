import { Tray } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../../../setup/root"
import { MenuLinkItem } from "../menu-link-item"

export const SubmissionInboxMenuItem = observer(() => {
  const { t } = useTranslation()
  const { userStore } = useMst()
  const { currentUser } = userStore

  return (
    <MenuLinkItem
      icon={<Tray size={20} />}
      label={t("site.breadcrumb.submissionInbox")}
      to={`/jurisdictions/${currentUser?.jurisdiction?.slug}/submission-inbox`}
    />
  )
})
