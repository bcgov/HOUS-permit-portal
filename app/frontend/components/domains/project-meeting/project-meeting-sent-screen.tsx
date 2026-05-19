import { Button, Container, Heading, ListItem, Text, UnorderedList } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { Link as RouterLink, useParams } from "react-router-dom"

export const ProjectMeetingSentScreen = observer(() => {
  const { t } = useTranslation()
  const { permitProjectId } = useParams<{ permitProjectId: string }>()

  return (
    <Container maxW="container.lg" p={8} as="main">
      <Heading as="h1" size="xl" mb={3}>
        {t("projectMeeting.sent.title")}
      </Heading>
      <Text mb={8}>{t("projectMeeting.sent.description")}</Text>
      <Heading as="h2" size="md" mb={3}>
        {t("projectMeeting.sent.whatHappensNext")}
      </Heading>
      <UnorderedList mb={8}>
        <ListItem>{t("projectMeeting.sent.next1")}</ListItem>
        <ListItem>{t("projectMeeting.sent.next2")}</ListItem>
        <ListItem>{t("projectMeeting.sent.next3")}</ListItem>
        <ListItem>{t("projectMeeting.sent.next4")}</ListItem>
      </UnorderedList>
      <Button as={RouterLink} to={`/projects/${permitProjectId}/overview`} variant="primary">
        {t("projectMeeting.sent.returnToProject")}
      </Button>
    </Container>
  )
})
