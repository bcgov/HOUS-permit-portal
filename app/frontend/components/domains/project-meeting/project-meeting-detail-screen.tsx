import { Box, Button, Container, Heading, HStack, Text } from "@chakra-ui/react"
import { CaretLeft } from "@phosphor-icons/react"
import { format } from "date-fns"
import { observer } from "mobx-react-lite"
import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { Navigate, useParams } from "react-router-dom"
import { datefnsTableDateTimeFormat } from "../../../constants"
import { usePermitProject } from "../../../hooks/resources/use-permit-project"
import { useProjectMeeting } from "../../../hooks/resources/use-project-meeting"
import { IPermitProject } from "../../../models/permit-project"
import { useMst } from "../../../setup/root"
import { EFlashMessageStatus, EProjectMeetingStatus } from "../../../types/enums"
import { ErrorScreen } from "../../shared/base/error-screen"
import { LoadingScreen } from "../../shared/base/loading-screen"
import { ConfirmationModal } from "../../shared/confirmation-modal"
import { RouterLinkButton } from "../../shared/navigation/router-link-button"
import { ProjectMeetingStatusTag } from "../../shared/project-meetings/project-meeting-status-tag"
import { ProjectMeetingStatusBanner } from "./detail/banners/project-meeting-status-banner"
import { DocumentsSection } from "./detail/sections/documents-section"
import { MeetingNotesSection } from "./detail/sections/meeting-notes-section"
import { ProjectInformationSection } from "./detail/sections/project-information-section"
import { RequestDetailsSection } from "./detail/sections/request-details-section"
import { RequesterInformationSection } from "./detail/sections/requester-information-section"

interface SubmitterProjectMeetingDetailContentProps {
  permitProject: IPermitProject
}

export const SubmitterProjectMeetingDetailContent = observer(
  ({ permitProject }: SubmitterProjectMeetingDetailContentProps) => {
    const { t } = useTranslation()
    const { permitProjectId: permitProjectIdParam } = useParams<{ permitProjectId: string }>()
    const { currentProjectMeeting, error, isLoading } = useProjectMeeting()
    const { projectMeetingStore, uiStore } = useMst()
    const [isCancelling, setIsCancelling] = useState(false)

    const permitProjectId = permitProject.id || permitProjectIdParam || currentProjectMeeting?.permitProjectId

    if (error) return <ErrorScreen error={error} />
    if (isLoading || !currentProjectMeeting) return <LoadingScreen />
    if (permitProject.id !== permitProjectId) return <LoadingScreen />
    if (currentProjectMeeting.status === EProjectMeetingStatus.draft && !permitProject.activeProjectMeeting) {
      return (
        <Navigate
          to={`/projects/${permitProjectId}/meetings/${currentProjectMeeting.id}/edit/project-information`}
          replace
        />
      )
    }

    const documents = currentProjectMeeting.meetingRequestDocuments.filter((document) => !document._destroy)
    const canCancelMeeting =
      permitProject.isOwner &&
      [EProjectMeetingStatus.open, EProjectMeetingStatus.scheduled].includes(currentProjectMeeting.status)
    const requesterEditPath =
      permitProject.isOwner && currentProjectMeeting.isActive
        ? `/projects/${permitProjectId}/meetings/${currentProjectMeeting.id}/edit/relationship`
        : null

    const handleCancelMeeting = async (closeModal: () => void) => {
      if (!permitProjectId) return

      setIsCancelling(true)
      const response = await projectMeetingStore.cancelProjectMeeting(permitProjectId, currentProjectMeeting.id)
      setIsCancelling(false)

      if (response.ok) {
        closeModal()
      } else {
        uiStore.flashMessage.show(EFlashMessageStatus.error, null, t("projectMeeting.detail.cancelError"), 5000)
      }
    }

    return (
      <Box as="section">
        <RouterLinkButton
          to={`/projects/${permitProjectId}/meetings`}
          leftIcon={<CaretLeft size={20} />}
          variant="link"
          mb={6}
          px={0}
        >
          {t("projectMeeting.detail.backToMeetings")}
        </RouterLinkButton>

        <HStack justify="space-between" align="flex-start" mb={8}>
          <Box>
            <Heading as="h1" size="xl" mb={3}>
              {t("projectMeeting.detail.title")}
            </Heading>
            <HStack spacing={2}>
              {currentProjectMeeting.submittedAt && (
                <Text>
                  {t("projectMeeting.detail.sentOn", {
                    date: format(currentProjectMeeting.submittedAt, datefnsTableDateTimeFormat),
                  })}
                </Text>
              )}
              <ProjectMeetingStatusTag status={currentProjectMeeting.status} />
            </HStack>
          </Box>
          <HStack spacing={4}>
            {canCancelMeeting && (
              <ConfirmationModal
                title={t("projectMeeting.detail.cancelConfirmationTitle")}
                body={t("projectMeeting.detail.cancelConfirmationBody")}
                triggerText={t("projectMeeting.detail.cancelMeeting")}
                triggerButtonProps={{ variant: "ghost", color: "text.secondary" }}
                renderConfirmationButton={(props) => (
                  <Button variant="primary" isLoading={isCancelling} {...props}>
                    {t("projectMeeting.detail.confirmCancelMeeting")}
                  </Button>
                )}
                modalContentProps={{ maxW: "604px" }}
                onConfirm={handleCancelMeeting}
              />
            )}
          </HStack>
        </HStack>

        <Box maxW="3xl">
          <ProjectMeetingStatusBanner
            activeProjectMeeting={permitProject.activeProjectMeeting}
            permitProjectId={permitProject.id}
            projectMeeting={currentProjectMeeting}
          />

          <ProjectInformationSection permitProject={permitProject} />
          <RequesterInformationSection projectMeeting={currentProjectMeeting} editPath={requesterEditPath} />
          <RequestDetailsSection projectMeeting={currentProjectMeeting} />
          <DocumentsSection documents={documents} />
          <MeetingNotesSection
            status={currentProjectMeeting.status}
            notes={currentProjectMeeting.notes}
            onDownloadNotes={() => currentProjectMeeting.downloadNotesCsv(permitProject.number)}
          />
        </Box>
      </Box>
    )
  }
)

export const ProjectMeetingDetailScreen = observer(() => {
  const { currentPermitProject, error } = usePermitProject()

  if (error) return <ErrorScreen error={error} />
  if (!currentPermitProject) return <LoadingScreen />

  return (
    <Container maxW="container.lg" p={8} as="main" ml={0}>
      <SubmitterProjectMeetingDetailContent permitProject={currentPermitProject} />
    </Container>
  )
})
