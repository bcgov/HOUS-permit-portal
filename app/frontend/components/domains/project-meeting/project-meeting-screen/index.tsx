import { Button, Container } from "@chakra-ui/react"
import { CaretLeft } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { Navigate, Link as RouterLink, useParams } from "react-router-dom"
import { usePermitProject } from "../../../../hooks/resources/use-permit-project"
import { useProjectMeeting } from "../../../../hooks/resources/use-project-meeting"
import { useMst } from "../../../../setup/root"
import { ErrorScreen } from "../../../shared/base/error-screen"
import { LoadingScreen } from "../../../shared/base/loading-screen"
import { projectMeetingNavSections } from "../nav-sections"
import { AuthorizationDocumentsSection } from "./sections/authorization-documents-section"
import { ContactDetailsSection } from "./sections/contact-details-section"
import { DiscussionSection } from "./sections/discussion-section"
import { DocumentsSection } from "./sections/documents-section"
import { ProjectInformationSection } from "./sections/project-information-section"
import { PropertyInformationSection } from "./sections/property-information-section"
import { RelationshipSection } from "./sections/relationship-section"
import { ReviewSection } from "./sections/review-section"

export const ProjectMeetingScreen = observer(() => {
  const { t } = useTranslation()
  const { section } = useParams<{ section: string }>()
  const { currentPermitProject, error: projectError } = usePermitProject()
  const { currentProjectMeeting, isLoading, error: meetingError } = useProjectMeeting()
  const { siteConfigurationStore } = useMst()

  if (projectError || meetingError) return <ErrorScreen />
  if (isLoading || !currentProjectMeeting || !currentPermitProject) return <LoadingScreen />
  if (
    !currentPermitProject.isOwner ||
    !siteConfigurationStore.projectMeetingsEnabled ||
    !currentPermitProject.jurisdiction?.projectMeetingsEnabled
  ) {
    return <ErrorScreen error={new Error(t("projectMeeting.validation.featureUnavailable"))} />
  }

  const meetingDetailPath = `/projects/${currentPermitProject.id}/meetings/${currentProjectMeeting.id}`
  const backPath = currentProjectMeeting.isSubmitted
    ? meetingDetailPath
    : `/projects/${currentPermitProject.id}/overview`

  if (currentProjectMeeting.isSubmitted) {
    const sectionConfig = projectMeetingNavSections.find((navSection) => navSection.location === section)
    if (!sectionConfig?.requesterEditStep || !currentProjectMeeting.isActive) {
      return <Navigate to={meetingDetailPath} replace />
    }
  }

  if (section === "authorization-documents" && !currentProjectMeeting.authorizationRequired) {
    return (
      <Navigate
        to={`/projects/${currentPermitProject.id}/meetings/${currentProjectMeeting.id}/edit/contact-details`}
        replace
      />
    )
  }

  if (section === "property-information" && !currentPermitProject.jurisdiction?.propertyInformationRequestsEnabled) {
    return (
      <Navigate to={`/projects/${currentPermitProject.id}/meetings/${currentProjectMeeting.id}/edit/review`} replace />
    )
  }

  const renderSection = () => {
    switch (section) {
      case "project-information":
        return <ProjectInformationSection />
      case "relationship":
        return <RelationshipSection meeting={currentProjectMeeting} />
      case "authorization-documents":
        return <AuthorizationDocumentsSection meeting={currentProjectMeeting} />
      case "contact-details":
        return <ContactDetailsSection meeting={currentProjectMeeting} />
      case "discussion":
        return <DiscussionSection meeting={currentProjectMeeting} />
      case "documents":
        return <DocumentsSection meeting={currentProjectMeeting} />
      case "property-information":
        return <PropertyInformationSection meeting={currentProjectMeeting} />
      case "review":
        return <ReviewSection meeting={currentProjectMeeting} />
      default:
        return <ProjectInformationSection />
    }
  }

  return (
    <Container maxW="container.lg" p={8} as="main">
      <Button variant="link" as={RouterLink} to={backPath} leftIcon={<CaretLeft size={20} />} mb={6}>
        {currentProjectMeeting.isSubmitted ? t("ui.back") : t("projectMeeting.backToProjectOverview")}
      </Button>
      {renderSection()}
    </Container>
  )
})
