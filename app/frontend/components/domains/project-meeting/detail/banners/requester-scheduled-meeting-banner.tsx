import { Link, VStack } from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { IProjectMeeting } from "../../../../../models/project-meeting"
import { EFlashMessageStatus } from "../../../../../types/enums"
import { CustomMessageBox } from "../../../../shared/base/custom-message-box"
import { InfoRow } from "../../../../shared/base/info-row"
import { FormattedDateTime } from "../formatted-date-time"

interface RequesterScheduledMeetingBannerProps {
  projectMeeting: IProjectMeeting
}

export const RequesterScheduledMeetingBanner = ({ projectMeeting }: RequesterScheduledMeetingBannerProps) => {
  const { t } = useTranslation()

  return (
    <CustomMessageBox
      status={EFlashMessageStatus.info}
      title={t("projectMeeting.detail.scheduledTitle")}
      mb={8}
      maxW="xl"
    >
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
    </CustomMessageBox>
  )
}
