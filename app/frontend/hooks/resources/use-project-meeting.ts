import { useEffect, useState } from "react"
import { useMatch, useParams } from "react-router-dom"
import { useMst } from "../../setup/root"
import { isUUID } from "../../utils/utility-functions"

export const useProjectMeeting = () => {
  const { projectMeetingId: projectMeetingIdParam } = useParams<{
    permitProjectId: string
    projectMeetingId: string
  }>()
  const projectMeetingDetailMatch = useMatch("/projects/:permitProjectId/meetings/:projectMeetingId")
  const reviewerMeetingDetailMatch = useMatch("/jurisdictions/:jurisdictionId/meetings/:meetingId")
  const projectMeetingId =
    projectMeetingIdParam ||
    projectMeetingDetailMatch?.params.projectMeetingId ||
    reviewerMeetingDetailMatch?.params.meetingId
  const { projectMeetingStore } = useMst()
  const { currentProjectMeeting, fetchProjectMeeting } = projectMeetingStore
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | undefined>(undefined)

  useEffect(() => {
    const loadProjectMeeting = async () => {
      if (!isUUID(projectMeetingId)) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      const meeting = await fetchProjectMeeting(projectMeetingId)
      setError(meeting ? undefined : new Error("Failed to fetch project meeting."))
      setIsLoading(false)
    }

    loadProjectMeeting()
  }, [projectMeetingId, fetchProjectMeeting])

  return { currentProjectMeeting, isLoading, error }
}
