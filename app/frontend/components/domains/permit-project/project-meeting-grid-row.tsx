import { Text } from "@chakra-ui/react"
import { format } from "date-fns"
import { observer } from "mobx-react-lite"
import React from "react"
import { useNavigate } from "react-router-dom"
import { datefnsTableDateTimeFormat } from "../../../constants"
import { IProjectMeeting } from "../../../models/project-meeting"
import { UnreadIndicatorDot } from "../../shared/base/unread-indicator-dot"
import { SearchGridItem } from "../../shared/grid/search-grid-item"
import { SearchGridRow } from "../../shared/grid/search-grid-row"
import { ProjectMeetingStatusTag } from "../../shared/project-meetings/project-meeting-status-tag"

interface IProjectMeetingGridRowProps {
  permitProjectId: string
  projectMeeting: IProjectMeeting
}

const formatMeetingDate = (projectMeeting: IProjectMeeting) => {
  const date = projectMeeting.confirmedDate || projectMeeting.submittedAt || projectMeeting.createdAt
  return date ? format(date, datefnsTableDateTimeFormat) : ""
}

export const ProjectMeetingGridRow = observer(({ permitProjectId, projectMeeting }: IProjectMeetingGridRowProps) => {
  const navigate = useNavigate()

  return (
    <SearchGridRow onClick={() => navigate(`/projects/${permitProjectId}/meetings/${projectMeeting.id}`)}>
      <SearchGridItem justifyContent="center">
        {/* TODO: add a read/unread indicator once we know what "unread" means */}
        <UnreadIndicatorDot display="none" />
      </SearchGridItem>
      <SearchGridItem>{formatMeetingDate(projectMeeting)}</SearchGridItem>
      <SearchGridItem>
        <Text noOfLines={1}>{projectMeeting.projectDescription || "—"}</Text>
      </SearchGridItem>
      <SearchGridItem>
        <ProjectMeetingStatusTag status={projectMeeting.status} />
      </SearchGridItem>
      <SearchGridItem>
        {/* MEETING NOTES TODO */}
        {/* Populate the notes column once its source and meaning are finalized. It should show the count of the total number of notes */}
        {null}
      </SearchGridItem>
    </SearchGridRow>
  )
})
