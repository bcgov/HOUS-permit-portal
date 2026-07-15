import { Button, ButtonProps } from "@chakra-ui/react"
import { CalendarCheck } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { IProjectMeeting } from "../../../../models/project-meeting"
import { useMst } from "../../../../setup/root"
import { EFlashMessageStatus } from "../../../../types/enums"

interface DownloadCalendarInviteButtonProps extends ButtonProps {
  projectMeeting: IProjectMeeting
}

export const DownloadCalendarInviteButton = observer(
  ({ projectMeeting, ...rest }: DownloadCalendarInviteButtonProps) => {
    const { t } = useTranslation()
    const { uiStore } = useMst()
    const [isDownloading, setIsDownloading] = useState(false)

    if (!projectMeeting.confirmedDate) return null

    const handleDownload = async () => {
      setIsDownloading(true)
      const ok = await projectMeeting.downloadCalendarInvite()
      setIsDownloading(false)

      if (!ok) {
        uiStore.flashMessage.show(
          EFlashMessageStatus.error,
          null,
          t("projectMeeting.detail.downloadCalendarError"),
          5000
        )
      }
    }

    return (
      <Button
        leftIcon={<CalendarCheck size={18} />}
        variant="secondary"
        size="sm"
        isLoading={isDownloading}
        onClick={handleDownload}
        {...rest}
      >
        {t("projectMeeting.detail.downloadCalendarInvite")}
      </Button>
    )
  }
)
