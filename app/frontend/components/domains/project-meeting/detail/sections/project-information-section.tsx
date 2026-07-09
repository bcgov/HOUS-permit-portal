import { Link } from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { Link as RouterLink } from "react-router-dom"
import { InfoRow } from "../../../../shared/base/info-row"
import { DetailSection } from "../detail-section"

type PermitProjectSource = {
  number?: string | null
  fullAddress?: string | null
  pid?: string | null
}

type ProjectMeetingSource = {
  projectNumber?: string | null
  projectAddress?: string | null
  projectPid?: string | null
}

interface ProjectInformationSectionProps {
  permitProject?: PermitProjectSource
  projectMeeting?: ProjectMeetingSource
  projectLink?: string | null
}

export const ProjectInformationSection = ({
  permitProject,
  projectMeeting,
  projectLink,
}: ProjectInformationSectionProps) => {
  const { t } = useTranslation()
  const notProvided = t("ui.notProvided")
  const projectNumber = permitProject?.number || projectMeeting?.projectNumber
  const projectAddress = permitProject?.fullAddress || projectMeeting?.projectAddress
  const projectPid = permitProject?.pid || projectMeeting?.projectPid

  const renderLinkedValue = (value: string | null | undefined, link?: string | null) => {
    if (!value) return notProvided

    if (link) {
      return (
        <Link as={RouterLink} to={link} color="text.link">
          {value}
        </Link>
      )
    }

    return value
  }

  return (
    <DetailSection title={t("projectMeeting.projectInformation")}>
      <InfoRow
        label={t("projectMeeting.detail.projectNumber")}
        value={renderLinkedValue(projectNumber, projectLink)}
        copyValue={projectNumber || undefined}
        isCopyable={!!projectNumber}
      />
      <InfoRow
        label={t("permitProject.overview.address")}
        value={renderLinkedValue(projectAddress, projectLink)}
        copyValue={projectAddress || undefined}
        isCopyable={!!projectAddress}
      />
      <InfoRow
        label={t("permitProject.overview.pid")}
        subLabel={t("permitProject.overview.parcelIdentifier")}
        value={projectPid || notProvided}
        copyValue={projectPid || undefined}
        isCopyable={!!projectPid}
      />
    </DetailSection>
  )
}
