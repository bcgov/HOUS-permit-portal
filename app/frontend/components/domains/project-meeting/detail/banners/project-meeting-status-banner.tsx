import { Box, Text } from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { IProjectMeeting } from "../../../../../models/project-meeting"
import { EFlashMessageStatus, EProjectMeetingStatus } from "../../../../../types/enums"
import { CustomMessageBox } from "../../../../shared/base/custom-message-box"
import { RouterLinkButton } from "../../../../shared/navigation/router-link-button"
import { DownloadCalendarInviteButton } from "../download-calendar-invite-button"
import { MeetingScheduleDetails } from "./meeting-schedule-details"

interface ProjectMeetingStatusBannerProps {
  projectMeeting: IProjectMeeting
  activeProjectMeeting?: IProjectMeeting | null
  permitProjectId: string
}

const statusMap: Record<EProjectMeetingStatus, EFlashMessageStatus> = {
  [EProjectMeetingStatus.draft]: EFlashMessageStatus.info,
  [EProjectMeetingStatus.open]: EFlashMessageStatus.info,
  [EProjectMeetingStatus.scheduled]: EFlashMessageStatus.info,
  [EProjectMeetingStatus.completed]: EFlashMessageStatus.success,
  [EProjectMeetingStatus.withdrawn]: EFlashMessageStatus.warning,
}

export const ProjectMeetingStatusBanner = ({
  activeProjectMeeting,
  permitProjectId,
  projectMeeting,
}: ProjectMeetingStatusBannerProps) => {
  const { t } = useTranslation()
  const showActiveDraftMessage =
    projectMeeting.status === EProjectMeetingStatus.draft &&
    !!activeProjectMeeting &&
    activeProjectMeeting.id !== projectMeeting.id
  const showMeetingDetails = [EProjectMeetingStatus.scheduled, EProjectMeetingStatus.completed].includes(
    projectMeeting.status
  )
  const detailsBorderColor =
    projectMeeting.status === EProjectMeetingStatus.completed ? "semantic.success" : "semantic.info"
  const bannerContent = (() => {
    switch (projectMeeting.status) {
      case EProjectMeetingStatus.draft:
        return {
          title: t("projectMeeting.detail.statusBanner.draft.title"),
          description: showActiveDraftMessage
            ? t(
                "projectMeeting.detail.statusBanner.draft.activeDescription",
                "This draft cannot be sent because another meeting request is already open or scheduled for this project."
              )
            : t("projectMeeting.detail.statusBanner.draft.description"),
        }
      case EProjectMeetingStatus.open:
        return {
          title: t("projectMeeting.detail.statusBanner.open.title"),
          description: t("projectMeeting.detail.statusBanner.open.description"),
        }
      case EProjectMeetingStatus.scheduled:
        return {
          title: t("projectMeeting.detail.statusBanner.scheduled.title"),
        }
      case EProjectMeetingStatus.completed:
        return {
          title: t("projectMeeting.detail.statusBanner.completed.title"),
        }
      case EProjectMeetingStatus.withdrawn:
        return {
          title: t("projectMeeting.detail.statusBanner.withdrawn.title"),
          description: t("projectMeeting.detail.statusBanner.withdrawn.description"),
        }
    }
  })()

  return (
    <Box mb={8} maxW="xl">
      <CustomMessageBox
        status={statusMap[projectMeeting.status]}
        title={bannerContent.title}
        description={showMeetingDetails || showActiveDraftMessage ? undefined : bannerContent.description}
        mb={0}
      >
        {showActiveDraftMessage && (
          <Text>
            {bannerContent.description}{" "}
            <RouterLinkButton
              variant="link"
              size="sm"
              h="auto"
              minW={0}
              p={0}
              to={`/projects/${permitProjectId}/meetings/${activeProjectMeeting.id}`}
            >
              {t("projectMeeting.detail.statusBanner.draft.viewActiveRequest", "View the active meeting request")}
            </RouterLinkButton>
          </Text>
        )}
        {showMeetingDetails && (
          <MeetingScheduleDetails projectMeeting={projectMeeting} borderColor={detailsBorderColor} />
        )}
      </CustomMessageBox>
      {showMeetingDetails && <DownloadCalendarInviteButton projectMeeting={projectMeeting} mt={4} />}
    </Box>
  )
}
