import { useEffect, useState } from "react"
import { useMatch, useParams } from "react-router-dom"
import { useMst } from "../../setup/root"
import { isUUID } from "../../utils/utility-functions"

export const useProjectMeeting = () => {
  const { permitProjectId, projectMeetingId: projectMeetingIdParam } = useParams<{
    permitProjectId: string
    projectMeetingId: string
  }>()
  const projectMeetingDetailMatch = useMatch("/projects/:permitProjectId/meetings/:projectMeetingId")
  const projectMeetingId = projectMeetingIdParam || projectMeetingDetailMatch?.params.projectMeetingId
  const { projectMeetingStore } = useMst()
  const { currentProjectMeeting, fetchProjectMeeting } = projectMeetingStore
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | undefined>(undefined)

  useEffect(() => {
    const loadProjectMeeting = async () => {
      if (!permitProjectId || !isUUID(projectMeetingId)) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      const meeting = await fetchProjectMeeting(permitProjectId, projectMeetingId)
      setError(meeting ? undefined : new Error("Failed to fetch project meeting."))
      setIsLoading(false)
    }

    loadProjectMeeting()
  }, [permitProjectId, projectMeetingId, fetchProjectMeeting])

  return { currentProjectMeeting, isLoading, error }
}
