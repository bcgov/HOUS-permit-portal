import { Box, Button, HStack } from "@chakra-ui/react"
import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { IProjectMeeting } from "../../../../../models/project-meeting"
import { EFlashMessageStatus, EProjectMeetingScheduleMode, EProjectMeetingStatus } from "../../../../../types/enums"
import { CustomMessageBox } from "../../../../shared/base/custom-message-box"
import { DownloadCalendarInviteButton } from "../download-calendar-invite-button"
import { MeetingScheduleDetails } from "./meeting-schedule-details"
import { ScheduleMeetingBanner } from "./schedule-meeting-banner"

interface ReviewerScheduledMeetingBannerProps {
  projectMeeting: IProjectMeeting
}

export const ReviewerScheduledMeetingBanner = ({ projectMeeting }: ReviewerScheduledMeetingBannerProps) => {
  const { t } = useTranslation()
  const [isEditing, setIsEditing] = useState(false)
  const isCompleted = projectMeeting.status === EProjectMeetingStatus.completed
  const status = isCompleted ? EFlashMessageStatus.success : EFlashMessageStatus.info
  const detailsBorderColor = isCompleted ? "semantic.success" : "semantic.info"

  useEffect(() => {
    if (projectMeeting.status !== EProjectMeetingStatus.scheduled) {
      setIsEditing(false)
    }
  }, [projectMeeting.status])

  if (isEditing) {
    return (
      <ScheduleMeetingBanner
        projectMeeting={projectMeeting}
        mode={EProjectMeetingScheduleMode.reschedule}
        onCancel={() => setIsEditing(false)}
      />
    )
  }

  return (
    <Box mb={8} maxW="xl">
      <CustomMessageBox
        status={status}
        title={
          isCompleted
            ? t("projectMeeting.detail.statusBanner.completed.title")
            : t("projectMeeting.detail.reviewer.scheduledTitle")
        }
        description={isCompleted ? undefined : t("projectMeeting.detail.reviewer.scheduledDescription")}
        mb={0}
      >
        <MeetingScheduleDetails projectMeeting={projectMeeting} borderColor={detailsBorderColor} />
        {(projectMeeting.status === EProjectMeetingStatus.scheduled || projectMeeting.confirmedDate) && (
          <HStack spacing={4} mt={4} alignSelf="flex-start" flexWrap="wrap">
            {projectMeeting.status === EProjectMeetingStatus.scheduled && (
              <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>
                {t("projectMeeting.detail.reviewer.changeMeetingDetails")}
              </Button>
            )}
            <DownloadCalendarInviteButton projectMeeting={projectMeeting} />
          </HStack>
        )}
      </CustomMessageBox>
    </Box>
  )
}
