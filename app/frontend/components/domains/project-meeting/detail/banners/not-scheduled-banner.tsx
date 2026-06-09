import React from "react"
import { useTranslation } from "react-i18next"
import { EFlashMessageStatus } from "../../../../../types/enums"
import { CustomMessageBox } from "../../../../shared/base/custom-message-box"

export const NotScheduledBanner = () => {
  const { t } = useTranslation()

  return (
    <CustomMessageBox
      status={EFlashMessageStatus.info}
      title={t("projectMeeting.detail.notScheduledTitle")}
      description={t("projectMeeting.detail.notScheduledDescription")}
      mb={8}
      maxW="xl"
    />
  )
}
