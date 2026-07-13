import { Box, Button } from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { IProjectMeeting } from "../../../../../models/project-meeting"
import { EFlashMessageStatus, EProjectMeetingScheduleMode, EProjectMeetingStatus } from "../../../../../types/enums"
import { CustomMessageBox } from "../../../../shared/base/custom-message-box"
import { MeetingScheduleDetails } from "./meeting-schedule-details"
import { ScheduleMeetingBanner } from "./schedule-meeting-banner"

interface ReviewerScheduledMeetingBannerProps {
  projectMeeting: IProjectMeeting
}

export const ReviewerScheduledMeetingBanner = ({ projectMeeting }: ReviewerScheduledMeetingBannerProps) => {
  const { t } = useTranslation()
  const [isEditing, setIsEditing] = React.useState(false)
  const isCompleted = projectMeeting.status === EProjectMeetingStatus.completed
  const status = isCompleted ? EFlashMessageStatus.success : EFlashMessageStatus.info
  const detailsBorderColor = isCompleted ? "semantic.success" : "semantic.info"

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
        {projectMeeting.status === EProjectMeetingStatus.scheduled && (
          <Button variant="secondary" size="sm" alignSelf="flex-start" mt={4} onClick={() => setIsEditing(true)}>
            {t("projectMeeting.detail.reviewer.changeMeetingDetails")}
          </Button>
        )}
      </CustomMessageBox>
    </Box>
  )
}
