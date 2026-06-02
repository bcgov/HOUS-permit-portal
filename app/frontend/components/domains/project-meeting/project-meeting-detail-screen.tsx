import { Box, Button, Container, Heading, HStack, Link, Text, VStack } from "@chakra-ui/react"
import { Check, Download } from "@phosphor-icons/react"
import { format } from "date-fns"
import { observer } from "mobx-react-lite"
import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { useParams } from "react-router-dom"
import { datefnsTableDateTimeFormat } from "../../../constants"
import { usePermitProject } from "../../../hooks/resources/use-permit-project"
import { useProjectMeeting } from "../../../hooks/resources/use-project-meeting"
import { IPermitProject } from "../../../models/permit-project"
import { useMst } from "../../../setup/root"
import { EFileUploadAttachmentType, EFlashMessageStatus, EProjectMeetingStatus } from "../../../types/enums"
import { IMeetingRequestDocument } from "../../../types/types"
import { CustomMessageBox } from "../../shared/base/custom-message-box"
import { ErrorScreen } from "../../shared/base/error-screen"
import { FileDownloadButton } from "../../shared/base/file-download-button"
import { InfoRow } from "../../shared/base/info-row"
import { LoadingScreen } from "../../shared/base/loading-screen"
import { ConfirmationModal } from "../../shared/confirmation-modal"
import { RouterLinkButton } from "../../shared/navigation/router-link-button"
import { ProjectMeetingStatusTag } from "../../shared/project-meetings/project-meeting-status-tag"

const DetailSection = ({ title, children }: { title: React.ReactNode; children: React.ReactNode }) => (
  <Box as="section" mb={8}>
    <Heading as="h2" size="lg" mb={4}>
      {title}
    </Heading>
    {children}
  </Box>
)

const FormattedDateTime = ({ date }: { date?: Date | null }) => {
  if (!date) return null

  return <>{format(date, datefnsTableDateTimeFormat)}</>
}

const activeDocuments = (documents: IMeetingRequestDocument[]) => documents.filter((document) => !document._destroy)

interface ProjectMeetingDetailContentProps {
  permitProject: IPermitProject
}

export const ProjectMeetingDetailContent = observer(({ permitProject }: ProjectMeetingDetailContentProps) => {
  const { t } = useTranslation()
  const { permitProjectId } = useParams<{ permitProjectId: string }>()
  const { currentProjectMeeting, error, isLoading } = useProjectMeeting()
  const { projectMeetingStore, uiStore } = useMst()
  const [isCancelling, setIsCancelling] = useState(false)

  if (error) return <ErrorScreen error={error} />
  if (isLoading || !currentProjectMeeting || permitProject.id !== permitProjectId) return <LoadingScreen />

  const documents = activeDocuments([...currentProjectMeeting.meetingRequestDocuments])
  const hasScheduledDetails =
    !!currentProjectMeeting.scheduledAt || !!currentProjectMeeting.confirmedDate || !!currentProjectMeeting.meetingUrl
  const notProvided = t("ui.notProvided")
  const canCancelMeeting =
    permitProject.isOwner &&
    [EProjectMeetingStatus.open, EProjectMeetingStatus.scheduled].includes(currentProjectMeeting.status)

  const handleCancelMeeting = async (closeModal: () => void) => {
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
      <RouterLinkButton to={`/projects/${permitProjectId}/meetings`} variant="link" mb={6} px={0}>
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

      <Box maxW="3xl">
        {hasScheduledDetails ? (
          <CustomMessageBox
            status={EFlashMessageStatus.info}
            title={t("projectMeeting.detail.scheduledTitle")}
            mb={8}
            maxW="xl"
          >
            <VStack align="stretch" spacing={1}>
              {currentProjectMeeting.confirmedDate && (
                <InfoRow
                  label={t("projectMeeting.detail.confirmedDate")}
                  value={<FormattedDateTime date={currentProjectMeeting.confirmedDate} />}
                  borderColor="semantic.info"
                />
              )}
              {currentProjectMeeting.scheduledAt && (
                <InfoRow
                  label={t("projectMeeting.detail.scheduledAt")}
                  value={<FormattedDateTime date={currentProjectMeeting.scheduledAt} />}
                  borderColor="semantic.info"
                />
              )}
              {currentProjectMeeting.meetingUrl && (
                <InfoRow
                  label={t("projectMeeting.detail.meetingUrl")}
                  value={
                    <Link href={currentProjectMeeting.meetingUrl} isExternal color="text.link">
                      {currentProjectMeeting.meetingUrl}
                    </Link>
                  }
                  copyValue={currentProjectMeeting.meetingUrl}
                  isCopyable
                  borderColor="semantic.info"
                />
              )}
            </VStack>
          </CustomMessageBox>
        ) : (
          <CustomMessageBox
            status={EFlashMessageStatus.info}
            title={t("projectMeeting.detail.notScheduledTitle")}
            description={t("projectMeeting.detail.notScheduledDescription")}
            mb={8}
            maxW="xl"
          />
        )}

        <DetailSection title={t("projectMeeting.projectInformation")}>
          <InfoRow
            label={t("projectMeeting.detail.projectNumber")}
            value={permitProject.number || notProvided}
            copyValue={permitProject.number || undefined}
            isCopyable={!!permitProject.number}
          />
          <InfoRow
            label={t("permitProject.overview.address")}
            value={permitProject.fullAddress || notProvided}
            copyValue={permitProject.fullAddress || undefined}
            isCopyable={!!permitProject.fullAddress}
          />
          <InfoRow
            label={t("permitProject.overview.pid")}
            subLabel={t("permitProject.overview.parcelIdentifier")}
            value={permitProject.pid || notProvided}
            copyValue={permitProject.pid || undefined}
            isCopyable={!!permitProject.pid}
          />
        </DetailSection>

        <DetailSection title={t("projectMeeting.detail.requesterInformation")}>
          <InfoRow
            label={t("projectMeeting.contactName")}
            value={currentProjectMeeting.contactName || notProvided}
            copyValue={currentProjectMeeting.contactName || undefined}
            isCopyable={!!currentProjectMeeting.contactName}
          />
          <InfoRow
            label={t("projectMeeting.detail.relationshipToSite")}
            value={
              currentProjectMeeting.requesterRelationship
                ? t(`projectMeeting.relationships.${currentProjectMeeting.requesterRelationship}`)
                : notProvided
            }
          />
          <InfoRow
            label={t("projectMeeting.contactEmail")}
            value={
              currentProjectMeeting.contactEmail ? (
                <Link href={`mailto:${currentProjectMeeting.contactEmail}`} color="text.link">
                  {currentProjectMeeting.contactEmail}
                </Link>
              ) : (
                notProvided
              )
            }
            copyValue={currentProjectMeeting.contactEmail || undefined}
            isCopyable={!!currentProjectMeeting.contactEmail}
          />
          <InfoRow
            label={t("projectMeeting.detail.phoneNumber")}
            value={currentProjectMeeting.contactPhoneNumber || notProvided}
            copyValue={currentProjectMeeting.contactPhoneNumber || undefined}
            isCopyable={!!currentProjectMeeting.contactPhoneNumber}
          />
        </DetailSection>

        <DetailSection title={t("projectMeeting.detail.requestDetails")}>
          <VStack align="stretch" spacing={5}>
            <Box>
              <Text fontWeight="bold" mb={2}>
                {t("projectMeeting.projectDescription")}
              </Text>
              <Text whiteSpace="pre-wrap">{currentProjectMeeting.projectDescription || notProvided}</Text>
            </Box>
            <Box>
              <Text fontWeight="bold" mb={2}>
                {t("projectMeeting.detail.requesterNotesAndQuestions")}
              </Text>
              <Text whiteSpace="pre-wrap">{currentProjectMeeting.meetingNotes || notProvided}</Text>
            </Box>
            <Box>
              <Text fontWeight="bold" mb={2}>
                {t("projectMeeting.detail.propertyInformationRequested")}
              </Text>
              <HStack spacing={1}>
                {currentProjectMeeting.requestPropertyInformation && <Check size={18} />}
                <Text>
                  {currentProjectMeeting.requestPropertyInformation === null
                    ? notProvided
                    : currentProjectMeeting.requestPropertyInformation
                      ? t("ui.yes")
                      : t("ui.no")}
                </Text>
              </HStack>
            </Box>
          </VStack>
        </DetailSection>

        <DetailSection title={t("projectMeeting.detail.documents")}>
          <Text mb={3}>{t("projectMeeting.detail.documentsDescription")}</Text>
          {documents.length > 0 ? (
            <VStack align="flex-start" spacing={1}>
              {documents.map((document) => (
                <FileDownloadButton
                  key={document.id || document.file?.id}
                  document={document}
                  modelType={EFileUploadAttachmentType.MeetingRequestDocument}
                  color="text.link"
                  px={0}
                />
              ))}
            </VStack>
          ) : (
            <Text color="text.secondary">{t("projectMeeting.detail.noDocuments")}</Text>
          )}
        </DetailSection>

        <DetailSection title={t("projectMeeting.detail.notes.title")}>
          {/* MEETING NOTES TODO */}
          {/* Wire this section up when reviewer notes are implemented. */}
          <Button variant="secondary" size="sm" leftIcon={<Download size={16} />} isDisabled mb={4}>
            {t("projectMeeting.detail.notes.downloadAll")}
          </Button>
          <Box border="1px" borderColor="border.light" borderRadius="md" p={4}>
            <Text fontWeight="bold" mb={1}>
              {t("projectMeeting.detail.notes.reviewerNotes")}
            </Text>
            <Text color="text.secondary">{t("projectMeeting.detail.notes.emptyDescription")}</Text>
          </Box>
        </DetailSection>
      </Box>
    </Box>
  )
})

export const ProjectMeetingDetailScreen = observer(() => {
  const { currentPermitProject, error } = usePermitProject()

  if (error) return <ErrorScreen error={error} />
  if (!currentPermitProject) return <LoadingScreen />

  return (
    <Container maxW="container.lg" p={8} as="main" ml={0}>
      <ProjectMeetingDetailContent permitProject={currentPermitProject} />
    </Container>
  )
})
