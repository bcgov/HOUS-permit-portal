import { Container } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { usePermitProject } from "../../../hooks/resources/use-permit-project"
import { useMst } from "../../../setup/root"
import { ErrorScreen } from "../../shared/base/error-screen"
import { LoadingScreen } from "../../shared/base/loading-screen"

export const ProjectMeetingNewScreen = observer(() => {
  const { permitProjectId } = useParams<{ permitProjectId: string }>()
  const { projectMeetingStore, siteConfigurationStore } = useMst()
  const { currentPermitProject, error: projectError } = usePermitProject()
  const navigate = useNavigate()
  const [error, setError] = useState(false)
  const hasStartedCreate = useRef(false)
  const projectIsLoaded = currentPermitProject?.id === permitProjectId && currentPermitProject.isFullyLoaded
  const canRequestProjectMeeting =
    projectIsLoaded &&
    currentPermitProject.isOwner &&
    siteConfigurationStore.projectMeetingsEnabled &&
    currentPermitProject.jurisdiction?.projectMeetingsEnabled

  useEffect(() => {
    const createDraft = async () => {
      if (hasStartedCreate.current || !projectIsLoaded) return
      hasStartedCreate.current = true

      if (!permitProjectId || !canRequestProjectMeeting) {
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
  }, [canRequestProjectMeeting, permitProjectId, projectIsLoaded, projectMeetingStore, navigate])

  if (error || projectError) return <ErrorScreen />
  if (!projectIsLoaded) {
    return (
      <Container maxW="container.lg" p={8} as="main">
        <LoadingScreen />
      </Container>
    )
  }

  return (
    <Container maxW="container.lg" p={8} as="main">
      <LoadingScreen />
    </Container>
  )
})
