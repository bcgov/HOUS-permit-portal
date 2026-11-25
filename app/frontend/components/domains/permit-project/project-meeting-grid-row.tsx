import { HStack, Text } from "@chakra-ui/react"
import { Chat } from "@phosphor-icons/react"
import { format } from "date-fns"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { datefnsTableDateTimeFormat } from "../../../constants"
import { IProjectMeeting } from "../../../models/project-meeting"
import { SearchGridItem } from "../../shared/grid/search-grid-item"
import { SearchGridRow } from "../../shared/grid/search-grid-row"
import { ProjectMeetingStatusTag } from "../../shared/project-meetings/project-meeting-status-tag"

interface IProjectMeetingGridRowProps {
  permitProjectId: string
  projectMeeting: IProjectMeeting
}

export const ProjectMeetingGridRow = observer(({ permitProjectId, projectMeeting }: IProjectMeetingGridRowProps) => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const meetingTime = projectMeeting.confirmedDate
    ? format(projectMeeting.confirmedDate, datefnsTableDateTimeFormat)
    : t("permitProject.meetings.pendingTime")

  return (
    <SearchGridRow onClick={() => navigate(`/projects/${permitProjectId}/meetings/${projectMeeting.id}`)}>
      <SearchGridItem>{meetingTime}</SearchGridItem>
      <SearchGridItem>
        <Text noOfLines={1}>{projectMeeting.projectDescription || "—"}</Text>
      </SearchGridItem>
      <SearchGridItem>
        <ProjectMeetingStatusTag status={projectMeeting.status} />
      </SearchGridItem>
      <SearchGridItem>
        <HStack spacing={1} color="text.secondary">
          <Chat size={14} />
          <Text>{projectMeeting.notesCount}</Text>
        </HStack>
      </SearchGridItem>
    </SearchGridRow>
  )
})
