import { Box, Button, Heading, HStack, Text } from "@chakra-ui/react"
import { CaretLeft } from "@phosphor-icons/react"
import { format } from "date-fns"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { datefnsTableDateTimeFormat } from "../../../../constants"
import { usePermitProject } from "../../../../hooks/resources/use-permit-project"
import { useProjectMeeting } from "../../../../hooks/resources/use-project-meeting"
import { IPermitProject } from "../../../../models/permit-project"
import { useMst } from "../../../../setup/root"
import { EFlashMessageStatus, EProjectMeetingStatus } from "../../../../types/enums"
import { ErrorScreen } from "../../../shared/base/error-screen"
import { LoadingScreen } from "../../../shared/base/loading-screen"
import { ConfirmationModal } from "../../../shared/confirmation-modal"
import { ProjectMeetingStatusTag } from "../../../shared/project-meetings/project-meeting-status-tag"
import { ReviewerScheduledMeetingBanner } from "../../project-meeting/detail/banners/reviewer-scheduled-meeting-banner"
import { ScheduleMeetingBanner } from "../../project-meeting/detail/banners/schedule-meeting-banner"
import { DocumentsSection } from "../../project-meeting/detail/sections/documents-section"
import { MeetingNotesSection } from "../../project-meeting/detail/sections/meeting-notes-section"
import { ProjectInformationSection } from "../../project-meeting/detail/sections/project-information-section"
import { RequestDetailsSection } from "../../project-meeting/detail/sections/request-details-section"
import { RequesterInformationSection } from "../../project-meeting/detail/sections/requester-information-section"

interface ReviewerMeetingDetailContentProps {
  jurisdictionId: string
  permitProject?: IPermitProject
}

export const ReviewerMeetingDetailContent = observer(
  ({ jurisdictionId, permitProject }: ReviewerMeetingDetailContentProps) => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { currentProjectMeeting, error: projectMeetingError, isLoading } = useProjectMeeting()
    const { currentPermitProject, error: permitProjectError } = usePermitProject(
      permitProject?.id ?? currentProjectMeeting?.permitProjectId
    )
    const { noteStore, projectMeetingStore, uiStore, userStore } = useMst()
    const { currentUser } = userStore
    const [isCancelling, setIsCancelling] = useState(false)
    const [isCompleting, setIsCompleting] = useState(false)

    useEffect(() => {
      if (currentUser?.isReviewStaff && currentProjectMeeting && !currentProjectMeeting.viewedAt) {
        currentProjectMeeting.markAsViewed()
      }
    }, [currentUser?.isReviewStaff, currentProjectMeeting?.id, currentProjectMeeting?.viewedAt])

    if (projectMeetingError || permitProjectError)
      return <ErrorScreen error={projectMeetingError || permitProjectError} />
    if (isLoading || !currentProjectMeeting) return <LoadingScreen />

    const downloadPermitProject = permitProject ?? currentPermitProject
    if (!downloadPermitProject || downloadPermitProject.id !== currentProjectMeeting.permitProjectId) {
      return <LoadingScreen />
    }

    const projectLink = `/jurisdictions/${jurisdictionId}/submission-inbox/projects/${currentProjectMeeting.permitProjectId}/overview`
    const canAddNote = currentUser?.isReviewStaff && currentProjectMeeting.canAddReviewerNote

    const handleCancelMeeting = async (closeModal: () => void) => {
      setIsCancelling(true)
      const response = await projectMeetingStore.transitionProjectMeetingStatus(
        currentProjectMeeting.permitProjectId,
        currentProjectMeeting.id,
        EProjectMeetingStatus.closed
      )
      setIsCancelling(false)

      if (response.ok) {
        closeModal()
      } else {
        uiStore.flashMessage.show(
          EFlashMessageStatus.error,
          null,
          t("projectMeeting.detail.reviewer.cancelError"),
          5000
        )
      }
    }

    const handleAddNote = async (body: string) => {
      const response = await noteStore.createProjectMeetingNote(currentProjectMeeting.id, body)
      return response.ok
    }

    const handleCompleteMeeting = async () => {
      setIsCompleting(true)
      const response = await projectMeetingStore.transitionProjectMeetingStatus(
        currentProjectMeeting.permitProjectId,
        currentProjectMeeting.id,
        EProjectMeetingStatus.completed
      )
      setIsCompleting(false)

      if (!response.ok) {
        uiStore.flashMessage.show(
          EFlashMessageStatus.error,
          null,
          t("projectMeeting.detail.reviewer.completeError"),
          5000
        )
      }
    }

    return (
      <Box as="section">
        <Button leftIcon={<CaretLeft size={20} />} variant="link" mb={6} px={0} onClick={() => navigate(-1)}>
          {t("ui.back")}
        </Button>

        <HStack justify="space-between" align="flex-start" mb={8}>
          <Box>
            <Heading as="h1" size="xl" mb={3}>
              {t("projectMeeting.detail.title")}
            </Heading>
            <HStack spacing={2}>
              {currentProjectMeeting.submittedAt && (
                <Text>
                  {t("projectMeeting.detail.reviewer.receivedOn", {
                    date: format(currentProjectMeeting.submittedAt, datefnsTableDateTimeFormat),
                  })}
                </Text>
              )}
              <ProjectMeetingStatusTag status={currentProjectMeeting.status} />
            </HStack>
          </Box>
          <HStack spacing={4}>
            {currentProjectMeeting.canComplete && (
              <Button variant="secondary" size="sm" onClick={handleCompleteMeeting} isLoading={isCompleting}>
                {t("projectMeeting.detail.reviewer.markCompleted")}
              </Button>
            )}
            {currentProjectMeeting.canCancel && (
              <ConfirmationModal
                title={t("projectMeeting.detail.reviewer.cancelConfirmationTitle")}
                body={t("projectMeeting.detail.reviewer.cancelConfirmationBody")}
                triggerText={t("projectMeeting.detail.reviewer.cancelMeeting")}
                triggerButtonProps={{ variant: "ghost", color: "text.secondary" }}
                renderConfirmationButton={(props) => (
                  <Button variant="primary" isLoading={isCancelling} {...props}>
                    {t("projectMeeting.detail.reviewer.confirmCancelMeeting")}
                  </Button>
                )}
                modalContentProps={{ maxW: "604px" }}
                onConfirm={handleCancelMeeting}
              />
            )}
          </HStack>
        </HStack>

        <Box maxW="3xl">
          {currentProjectMeeting.canSchedule && <ScheduleMeetingBanner projectMeeting={currentProjectMeeting} />}

          {currentProjectMeeting.shouldShowScheduledBanner && (
            <ReviewerScheduledMeetingBanner projectMeeting={currentProjectMeeting} />
          )}

          <ProjectInformationSection projectMeeting={currentProjectMeeting} projectLink={projectLink} />
          <RequesterInformationSection projectMeeting={currentProjectMeeting} />
          <RequestDetailsSection projectMeeting={currentProjectMeeting} />
          <DocumentsSection documents={currentProjectMeeting.activeMeetingRequestDocuments} />
          <MeetingNotesSection
            status={currentProjectMeeting.status}
            notes={currentProjectMeeting.notes}
            showVisibilityBanner
            canAddNote={canAddNote}
            onAddNote={handleAddNote}
            onDownloadNotes={() => currentProjectMeeting.downloadNotesCsv(downloadPermitProject.number)}
          />
        </Box>
      </Box>
    )
  }
)
