import { Box, Button, Heading, HStack, Text } from "@chakra-ui/react"
import { ArrowUUpLeft, CaretLeft } from "@phosphor-icons/react"
import { format } from "date-fns"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { datefnsTableDateTimeFormat } from "../../../../constants"
import { useProjectMeeting } from "../../../../hooks/resources/use-project-meeting"
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
}

const showScheduledBanner = (status: EProjectMeetingStatus, hasScheduledDetails: boolean) => {
  if (status === EProjectMeetingStatus.closed) return false
  if ([EProjectMeetingStatus.scheduled, EProjectMeetingStatus.completed].includes(status)) return true
  return hasScheduledDetails
}

export const ReviewerMeetingDetailContent = observer(({ jurisdictionId }: ReviewerMeetingDetailContentProps) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { currentProjectMeeting, error, isLoading } = useProjectMeeting()
  const { projectMeetingStore, uiStore, userStore } = useMst()
  const { currentUser } = userStore
  const [isCancelling, setIsCancelling] = useState(false)

  useEffect(() => {
    if (currentUser?.isReviewStaff && currentProjectMeeting && !currentProjectMeeting.viewedAt) {
      currentProjectMeeting.markAsViewed()
    }
  }, [currentUser?.isReviewStaff, currentProjectMeeting?.id, currentProjectMeeting?.viewedAt])

  if (error) return <ErrorScreen error={error} />
  if (isLoading || !currentProjectMeeting) return <LoadingScreen />

  const documents = currentProjectMeeting.meetingRequestDocuments.filter((document) => !document._destroy)
  const hasScheduledDetails =
    !!currentProjectMeeting.scheduledAt || !!currentProjectMeeting.confirmedDate || !!currentProjectMeeting.meetingUrl
  const canScheduleMeeting =
    currentProjectMeeting.status === EProjectMeetingStatus.open &&
    currentProjectMeeting.allowedManualTransitions.includes(EProjectMeetingStatus.scheduled)
  const canCancelMeeting = currentProjectMeeting.allowedManualTransitions.includes(EProjectMeetingStatus.closed)
  const showReOpenRequest = currentProjectMeeting.status === EProjectMeetingStatus.closed
  const projectLink = `/jurisdictions/${jurisdictionId}/submission-inbox/projects/${currentProjectMeeting.permitProjectId}/overview`
  const internalNotesLink = `/jurisdictions/${jurisdictionId}/submission-inbox/projects/${currentProjectMeeting.permitProjectId}/notes`
  const canAddNote = currentUser?.isReviewStaff && currentProjectMeeting.isActive
  const notes = projectMeetingStore.currentProjectMeetingNotes

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
      uiStore.flashMessage.show(EFlashMessageStatus.error, null, t("projectMeeting.detail.reviewer.cancelError"), 5000)
    }
  }

  const handleAddNote = async (body: string) => {
    const response = await projectMeetingStore.createProjectMeetingNote(currentProjectMeeting.id, body)
    return response.ok
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
          {canCancelMeeting && (
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
          {showReOpenRequest && (
            /* Re-open request — wire up when backend transition from closed is implemented */
            <Button variant="secondary" size="sm" leftIcon={<ArrowUUpLeft size={14} />} isDisabled>
              {t("projectMeeting.detail.reviewer.reOpenRequest")}
            </Button>
          )}
        </HStack>
      </HStack>

      <Box maxW="3xl">
        {canScheduleMeeting && <ScheduleMeetingBanner projectMeeting={currentProjectMeeting} />}

        {showScheduledBanner(currentProjectMeeting.status, hasScheduledDetails) && (
          <ReviewerScheduledMeetingBanner projectMeeting={currentProjectMeeting} />
        )}

        <ProjectInformationSection projectMeeting={currentProjectMeeting} projectLink={projectLink} />
        <RequesterInformationSection projectMeeting={currentProjectMeeting} />
        <RequestDetailsSection projectMeeting={currentProjectMeeting} />
        <DocumentsSection documents={documents} />
        <MeetingNotesSection
          status={currentProjectMeeting.status}
          notes={notes}
          showVisibilityBanner
          internalNotesLink={internalNotesLink}
          canAddNote={canAddNote}
          onAddNote={handleAddNote}
          onDownloadNotes={() => projectMeetingStore.downloadProjectMeetingNotesCsv(currentProjectMeeting.id)}
        />
      </Box>
    </Box>
  )
})
