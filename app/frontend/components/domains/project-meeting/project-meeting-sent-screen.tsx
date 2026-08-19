import { Button, Container, Heading, ListItem, Text, UnorderedList } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { Link as RouterLink, useParams } from "react-router-dom"
import { usePermitProject } from "../../../hooks/resources/use-permit-project"
import { useMst } from "../../../setup/root"
import { ErrorScreen } from "../../shared/base/error-screen"
import { LoadingScreen } from "../../shared/base/loading-screen"

export const ProjectMeetingSentScreen = observer(() => {
  const { t } = useTranslation()
  const { permitProjectId } = useParams<{ permitProjectId: string }>()
  const { currentPermitProject, error } = usePermitProject()
  const { siteConfigurationStore } = useMst()

  if (error) return <ErrorScreen />
  if (!currentPermitProject || currentPermitProject.id !== permitProjectId) return <LoadingScreen />
  if (
    !currentPermitProject.canManageMeetings ||
    !siteConfigurationStore.projectMeetingsEnabled ||
    !currentPermitProject.jurisdiction?.projectMeetingsEnabled
  ) {
    return <ErrorScreen error={new Error(t("projectMeeting.validation.featureUnavailable"))} />
  }

  return (
    <Container maxW="container.lg" p={8} as="main">
      <Heading as="h1" size="xl" mb={3}>
        {t("projectMeeting.sent.title")}
      </Heading>
      <Text mb={8}>{t("projectMeeting.sent.description")}</Text>
      <Heading as="h2" size="lg" variant="yellowline" mb={3}>
        {t("projectMeeting.sent.whatHappensNext")}
      </Heading>
      <UnorderedList mb={8}>
        <ListItem>{t("projectMeeting.sent.next1")}</ListItem>
        <ListItem>{t("projectMeeting.sent.next2")}</ListItem>
        <ListItem>{t("projectMeeting.sent.next3")}</ListItem>
        <ListItem>{t("projectMeeting.sent.next4")}</ListItem>
        <ListItem>{t("projectMeeting.sent.next5")}</ListItem>
        <ListItem>{t("projectMeeting.sent.next6")}</ListItem>
      </UnorderedList>
      <Button as={RouterLink} to={`/projects/${permitProjectId}/overview`} variant="primary">
        {t("projectMeeting.sent.returnToProject")}
      </Button>
    </Container>
  )
})
