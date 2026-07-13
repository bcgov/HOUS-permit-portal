import { Box, Link, Text, VStack } from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { IProjectMeeting } from "../../../../../models/project-meeting"
import { EFlashMessageStatus, EProjectMeetingStatus } from "../../../../../types/enums"
import { CustomMessageBox } from "../../../../shared/base/custom-message-box"
import { InfoRow } from "../../../../shared/base/info-row"
import { RouterLinkButton } from "../../../../shared/navigation/router-link-button"
import { DownloadCalendarInviteButton } from "../download-calendar-invite-button"
import { FormattedDateTime } from "../formatted-date-time"

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
  [EProjectMeetingStatus.closed]: EFlashMessageStatus.warning,
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
  const showScheduledDetails = projectMeeting.status === EProjectMeetingStatus.scheduled
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
          description: t("projectMeeting.detail.statusBanner.completed.description"),
        }
      case EProjectMeetingStatus.closed:
        return {
          title: t("projectMeeting.detail.statusBanner.closed.title"),
          description: t("projectMeeting.detail.statusBanner.closed.description"),
        }
    }
  })()

  return (
    <Box mb={8} maxW="xl">
      <CustomMessageBox
        status={statusMap[projectMeeting.status]}
        title={bannerContent.title}
        description={showScheduledDetails || showActiveDraftMessage ? undefined : bannerContent.description}
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
        {showScheduledDetails && (
          <VStack align="stretch" spacing={1}>
            {projectMeeting.contactMethod && (
              <InfoRow
                label={t("projectMeeting.detail.contactMethod")}
                value={t(`projectMeeting.contactMethods.${projectMeeting.contactMethod}`)}
                borderColor="semantic.info"
              />
            )}
            {projectMeeting.confirmedDate && (
              <InfoRow
                label={t("projectMeeting.detail.confirmedDate")}
                value={<FormattedDateTime date={projectMeeting.confirmedDate} />}
                borderColor="semantic.info"
              />
            )}
            {projectMeeting.scheduledAt && (
              <InfoRow
                label={t("projectMeeting.detail.scheduledAt")}
                value={<FormattedDateTime date={projectMeeting.scheduledAt} />}
                borderColor="semantic.info"
              />
            )}
            {projectMeeting.meetingUrl && (
              <InfoRow
                label={t("projectMeeting.detail.meetingUrl")}
                value={
                  <Link href={projectMeeting.meetingUrl} isExternal color="text.link">
                    {projectMeeting.meetingUrl}
                  </Link>
                }
                copyValue={projectMeeting.meetingUrl}
                isCopyable
                borderColor="semantic.info"
              />
            )}
          </VStack>
        )}
      </CustomMessageBox>
      {showScheduledDetails && <DownloadCalendarInviteButton projectMeeting={projectMeeting} mt={4} />}
    </Box>
  )
}
