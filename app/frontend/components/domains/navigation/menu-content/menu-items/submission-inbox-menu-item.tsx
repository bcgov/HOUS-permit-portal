import { Tray } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../../../setup/root"
import { EInboxViewMode } from "../../../../../types/enums"
import { MenuLinkItem } from "../menu-link-item"

export const SubmissionInboxMenuItem = observer(() => {
  const { t } = useTranslation()
  const { userStore, submissionInboxStore } = useMst()
  const { currentUser } = userStore
  const { viewMode } = submissionInboxStore
  const jurisdiction = currentUser?.jurisdiction

  const count =
    viewMode === EInboxViewMode.projects
      ? (jurisdiction?.unviewedProjectsCount ?? 0)
      : (jurisdiction?.unviewedSubmissionsCount ?? 0)

  return (
    <MenuLinkItem
      icon={<Tray size={20} />}
      label={t("site.breadcrumb.submissionInbox")}
      to={`/jurisdictions/${jurisdiction?.slug}/submission-inbox`}
      badge={count}
    />
  )
})
