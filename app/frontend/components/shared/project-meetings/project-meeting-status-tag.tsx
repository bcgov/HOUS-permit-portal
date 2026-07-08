import { Tag, TagProps } from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { EProjectMeetingStatus } from "../../../types/enums"

const projectMeetingStatusBgMap: Record<EProjectMeetingStatus, string> = {
  [EProjectMeetingStatus.draft]: "greys.grey04",
  [EProjectMeetingStatus.open]: "semantic.infoLight",
  [EProjectMeetingStatus.scheduled]: "semantic.warningLight",
  [EProjectMeetingStatus.completed]: "semantic.successLight",
  [EProjectMeetingStatus.closed]: "greys.grey04",
}

const projectMeetingStatusBorderColorMap: Record<EProjectMeetingStatus, string> = {
  [EProjectMeetingStatus.draft]: "border.light",
  [EProjectMeetingStatus.open]: "semantic.info",
  [EProjectMeetingStatus.scheduled]: "semantic.warning",
  [EProjectMeetingStatus.completed]: "semantic.success",
  [EProjectMeetingStatus.closed]: "border.light",
}

interface IProjectMeetingStatusTagProps extends TagProps {
  status: EProjectMeetingStatus
}

export const ProjectMeetingStatusTag = React.forwardRef<HTMLSpanElement, IProjectMeetingStatusTagProps>(
  ({ status, ...rest }, ref) => {
    const { t } = useTranslation()

    return (
      <Tag
        ref={ref}
        p={1}
        bg={projectMeetingStatusBgMap[status] || "greys.grey04"}
        color="text.primary"
        fontWeight="medium"
        border="1px solid"
        borderColor={projectMeetingStatusBorderColorMap[status] || "border.light"}
        textTransform="capitalize"
        minW="fit-content"
        textAlign="center"
        {...rest}
      >
        {t(`projectMeeting.status.${status}`)}
      </Tag>
    )
  }
)

ProjectMeetingStatusTag.displayName = "ProjectMeetingStatusTag"
