import React from "react"
import { useTranslation } from "react-i18next"
import { EFlashMessageStatus } from "../../../../../types/enums"
import { CustomMessageBox } from "../../../../shared/base/custom-message-box"

export const MeetingNotesVisibilityBanner = () => {
  const { t } = useTranslation()

  return (
    <CustomMessageBox
      status={EFlashMessageStatus.warning}
      title={t("projectMeeting.detail.reviewer.notesVisibilityTitle")}
      description={t("projectMeeting.detail.reviewer.notesVisibilityDescription")}
      mb={4}
    />
  )
}
