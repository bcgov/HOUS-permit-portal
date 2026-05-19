import { Container } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useMst } from "../../../setup/root"
import { ErrorScreen } from "../../shared/base/error-screen"
import { LoadingScreen } from "../../shared/base/loading-screen"

export const ProjectMeetingNewScreen = observer(() => {
  const { permitProjectId } = useParams<{ permitProjectId: string }>()
  const { projectMeetingStore } = useMst()
  const navigate = useNavigate()
  const [error, setError] = useState(false)
  const hasStartedCreate = useRef(false)

  useEffect(() => {
    const createDraft = async () => {
      if (hasStartedCreate.current) return
      hasStartedCreate.current = true

      if (!permitProjectId) {
        setError(true)
        return
      }

      const meeting = await projectMeetingStore.createProjectMeeting(permitProjectId)
      if (meeting) {
        navigate(`/projects/${permitProjectId}/meetings/${meeting.id}/edit/project-information`, { replace: true })
      } else {
        setError(true)
      }
    }

    createDraft()
  }, [permitProjectId, projectMeetingStore, navigate])

  if (error) return <ErrorScreen />

  return (
    <Container maxW="container.lg" p={8} as="main">
      <LoadingScreen />
    </Container>
  )
})
