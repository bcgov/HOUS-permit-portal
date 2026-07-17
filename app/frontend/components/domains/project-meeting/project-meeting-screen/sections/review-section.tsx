import { Box, Button, Heading, HStack, Link, Text } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { useNavigate, useParams } from "react-router-dom"
import { usePermitProject } from "../../../../../hooks/resources/use-permit-project"
import { IProjectMeeting } from "../../../../../models/project-meeting"
import { useMst } from "../../../../../setup/root"
import {
  EFlashMessageStatus,
  EMeetingRequestDocumentType,
  EProjectMeetingRequesterRelationship,
} from "../../../../../types/enums"
import { mailtoHref, telHref } from "../../../../../utils/utility-functions"
import ProjectInfoRow from "../../../../shared/project/project-info-row"
import { useProjectMeetingNavigation } from "../../use-project-meeting-navigation"
import { activeDocumentsForType } from "../shared/document-utils"
import { SectionHeading } from "../shared/section-heading"
import { ReviewSummarySection } from "./review-summary-section"

interface ReviewSectionProps {
  meeting: IProjectMeeting
}

export const ReviewSection = observer(({ meeting }: ReviewSectionProps) => {
  const { t } = useTranslation()
  const { currentPermitProject } = usePermitProject()
  const { permitProjectId } = useParams<{ permitProjectId: string }>()
  const { projectMeetingStore, uiStore } = useMst()
  const { navigateToSection, navigateToPrevious } = useProjectMeetingNavigation()
  const navigate = useNavigate()
  const authorizationDocuments = activeDocumentsForType(
    [...meeting.meetingRequestDocuments],
    EMeetingRequestDocumentType.authorization
  )
  const supportingDocuments = activeDocumentsForType(
    [...meeting.meetingRequestDocuments],
    EMeetingRequestDocumentType.supporting
  )
  const isAuthorizationRequired =
    !!meeting.requesterRelationship &&
    meeting.requesterRelationship !== EProjectMeetingRequesterRelationship.ownerOrLandholder
  const propertyInformationRequestsEnabled =
    currentPermitProject?.jurisdiction?.propertyInformationRequestsEnabled ?? false

  const submit = async () => {
    const response = await projectMeetingStore.submitProjectMeeting(permitProjectId, meeting.id)
    if (response.ok) {
      navigate(`/projects/${permitProjectId}/meetings/${meeting.id}/sent`)
    } else {
      uiStore.flashMessage.show(EFlashMessageStatus.error, null, t("projectMeeting.validation.submitError"), 5000)
    }
  }

  return (
    <Box>
      <SectionHeading title={t("projectMeeting.sections.review.title")} />
      <ReviewSummarySection
        title={t("projectMeeting.projectInformation")}
        sectionKey="projectInformation"
        onNavigateToSection={navigateToSection}
        showChangeLink={false}
      >
        <ProjectInfoRow label={t("permitProject.overview.address")} value={currentPermitProject?.fullAddress} stacked />
        <ProjectInfoRow label={t("permitProject.overview.pid")} value={currentPermitProject?.pid} stacked />
        <ProjectInfoRow
          label={t("permitProject.overview.jurisdictionName")}
          value={currentPermitProject?.jurisdiction?.disambiguatedName}
          stacked
        />
      </ReviewSummarySection>
      <ReviewSummarySection
        title={t("projectMeeting.sections.relationship.title")}
        sectionKey="relationship"
        onNavigateToSection={navigateToSection}
      >
        <Text>
          {meeting.requesterRelationship && t(`projectMeeting.relationships.${meeting.requesterRelationship}`)}
        </Text>
      </ReviewSummarySection>
      <ReviewSummarySection
        title={t("projectMeeting.sections.discussion.title")}
        sectionKey="discussion"
        onNavigateToSection={navigateToSection}
      >
        <ProjectInfoRow label={t("projectMeeting.projectDescription")} value={meeting.projectDescription} stacked />
        <ProjectInfoRow
          label={t("projectMeeting.meetingNotes")}
          value={meeting.meetingNotes || t("ui.notProvided")}
          stacked
        />
      </ReviewSummarySection>
      {isAuthorizationRequired && (
        <ReviewSummarySection
          title={t("projectMeeting.sections.documents.authorizationTitle")}
          sectionKey="authorizationDocuments"
          onNavigateToSection={navigateToSection}
        >
          {authorizationDocuments.length > 0 ? (
            authorizationDocuments.map((doc) => (
              <Text key={doc.id || doc.file?.id}>{doc.file?.metadata?.filename}</Text>
            ))
          ) : (
            <Text>{t("ui.notProvided")}</Text>
          )}
        </ReviewSummarySection>
      )}
      <ReviewSummarySection
        title={t("projectMeeting.sections.documents.title")}
        sectionKey="documents"
        onNavigateToSection={navigateToSection}
      >
        {supportingDocuments.length > 0 ? (
          supportingDocuments.map((doc) => <Text key={doc.id || doc.file?.id}>{doc.file?.metadata?.filename}</Text>)
        ) : (
          <Text>{t("ui.notProvided")}</Text>
        )}
      </ReviewSummarySection>
      <ReviewSummarySection
        title={t("projectMeeting.sections.contactDetails.title")}
        sectionKey="contactDetails"
        onNavigateToSection={navigateToSection}
      >
        <ProjectInfoRow label={t("projectMeeting.contactName")} value={meeting.contactName} stacked />
        <ProjectInfoRow
          label={t("projectMeeting.contactEmail")}
          value={
            meeting.contactEmail ? (
              <Link href={mailtoHref(meeting.contactEmail)} color="text.link">
                {meeting.contactEmail}
              </Link>
            ) : (
              t("ui.notProvided")
            )
          }
          stacked
        />
        <ProjectInfoRow
          label={t("projectMeeting.contactPhoneNumber")}
          value={
            meeting.contactPhoneNumber ? (
              <Link href={telHref(meeting.contactPhoneNumber)} color="text.link">
                {meeting.contactPhoneNumber}
              </Link>
            ) : (
              t("ui.notProvided")
            )
          }
          stacked
        />
      </ReviewSummarySection>
      {propertyInformationRequestsEnabled && (
        <ReviewSummarySection
          title={t("projectMeeting.sections.propertyInformation.title")}
          sectionKey="propertyInformation"
          onNavigateToSection={navigateToSection}
        >
          <Text>{meeting.requestPropertyInformation ? t("ui.yes") : t("ui.no")}</Text>
        </ReviewSummarySection>
      )}
      <Box mb={8}>
        <Heading as="h2" size="lg" variant="yellowline" mb={4}>
          {t("projectMeeting.sendRequest")}
        </Heading>
        <Text mb={4}>{t("projectMeeting.sendRequestDescription")}</Text>
        <HStack spacing={3}>
          <Button variant="secondary" onClick={navigateToPrevious}>
            {t("ui.back")}
          </Button>
          <Button variant="primary" onClick={submit} isDisabled={!meeting.isReadyForSubmission}>
            {t("projectMeeting.acceptAndSend")}
          </Button>
        </HStack>
      </Box>
    </Box>
  )
})
