import { Link, VStack } from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { IProjectMeeting } from "../../../../../models/project-meeting"
import { InfoRow } from "../../../../shared/base/info-row"
import { FormattedDateTime } from "../formatted-date-time"

interface MeetingScheduleDetailsProps {
  projectMeeting: IProjectMeeting
  borderColor?: string
}

export const MeetingScheduleDetails = ({
  projectMeeting,
  borderColor = "semantic.info",
}: MeetingScheduleDetailsProps) => {
  const { t } = useTranslation()

  return (
    <VStack align="stretch" spacing={1}>
      {projectMeeting.contactMethod && (
        <InfoRow
          label={t("projectMeeting.detail.contactMethod")}
          value={t(`projectMeeting.contactMethods.${projectMeeting.contactMethod}`)}
          borderColor={borderColor}
        />
      )}
      {projectMeeting.confirmedDate && (
        <InfoRow
          label={t("projectMeeting.detail.confirmedDate")}
          value={<FormattedDateTime date={projectMeeting.confirmedDate} />}
          borderColor={borderColor}
        />
      )}
      {projectMeeting.scheduledAt && (
        <InfoRow
          label={t("projectMeeting.detail.scheduledAt")}
          value={<FormattedDateTime date={projectMeeting.scheduledAt} />}
          borderColor={borderColor}
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
          borderColor={borderColor}
        />
      )}
    </VStack>
  )
}
