import { Link } from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { IProjectMeeting } from "../../../../../models/project-meeting"
import { InfoRow } from "../../../../shared/base/info-row"
import { DetailSection } from "../detail-section"

interface RequesterInformationSectionProps {
  projectMeeting: IProjectMeeting
}

export const RequesterInformationSection = ({ projectMeeting }: RequesterInformationSectionProps) => {
  const { t } = useTranslation()
  const notProvided = t("ui.notProvided")

  return (
    <DetailSection title={t("projectMeeting.detail.requesterInformation")}>
      <InfoRow
        label={t("projectMeeting.contactName")}
        value={projectMeeting.contactName || notProvided}
        copyValue={projectMeeting.contactName || undefined}
        isCopyable={!!projectMeeting.contactName}
      />
      <InfoRow
        label={t("projectMeeting.detail.relationshipToSite")}
        value={
          projectMeeting.requesterRelationship
            ? t(`projectMeeting.relationships.${projectMeeting.requesterRelationship}`)
            : notProvided
        }
      />
      <InfoRow
        label={t("projectMeeting.contactEmail")}
        value={
          projectMeeting.contactEmail ? (
            <Link href={`mailto:${projectMeeting.contactEmail}`} color="text.link">
              {projectMeeting.contactEmail}
            </Link>
          ) : (
            notProvided
          )
        }
        copyValue={projectMeeting.contactEmail || undefined}
        isCopyable={!!projectMeeting.contactEmail}
      />
      <InfoRow
        label={t("projectMeeting.detail.phoneNumber")}
        value={projectMeeting.contactPhoneNumber || notProvided}
        copyValue={projectMeeting.contactPhoneNumber || undefined}
        isCopyable={!!projectMeeting.contactPhoneNumber}
      />
    </DetailSection>
  )
}
