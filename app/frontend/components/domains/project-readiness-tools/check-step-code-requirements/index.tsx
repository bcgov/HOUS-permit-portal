import { Box, Container, Heading, ListItem, Text, UnorderedList } from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../../setup/root"
import { RouterLink } from "../../../shared/navigation/router-link"
import { RouterLinkButton } from "../../../shared/navigation/router-link-button"

export const CheckStepCodeRequirementsScreen = () => {
  const { t } = useTranslation()
  const { userStore } = useMst()
  const { currentUser } = userStore

  return (
    <Container maxW="container.lg" py={16}>
      <Box>
        <Heading as="h1">{t("home.projectReadinessTools.checkStepCodeRequirementsScreen.pageHeading")}</Heading>
        <Text mt={8}>{t("home.projectReadinessTools.checkStepCodeRequirementsScreen.toolIntro")}</Text>
        <UnorderedList mt={4} spacing={2}>
          <ListItem>{t("home.projectReadinessTools.checkStepCodeRequirementsScreen.toolPoint1")}</ListItem>
          <ListItem>{t("home.projectReadinessTools.checkStepCodeRequirementsScreen.toolPoint2")}</ListItem>
        </UnorderedList>
        <RouterLinkButton variant="primary" mt={8} to="/project-readiness-tools/check-step-code-requirements/new">
          {currentUser ? t("ui.start") : t("home.projectReadinessTools.checkStepCodeRequirementsScreen.loginButton")}
        </RouterLinkButton>

        <Heading as="h2" size="lg" mt={16}>
          {t("home.projectReadinessTools.checkStepCodeRequirementsScreen.whoTitle")}
        </Heading>
        <Text mt={4}>{t("home.projectReadinessTools.checkStepCodeRequirementsScreen.whoDescription")}</Text>
        <UnorderedList mt={4} spacing={2}>
          <ListItem>{t("home.projectReadinessTools.checkStepCodeRequirementsScreen.whoPoint1")}</ListItem>
          <ListItem>{t("home.projectReadinessTools.checkStepCodeRequirementsScreen.whoPoint2")}</ListItem>
        </UnorderedList>

        <Heading as="h2" size="lg" mt={16}>
          {t("home.projectReadinessTools.checkStepCodeRequirementsScreen.whenTitle")}
        </Heading>
        <Text mt={4}>{t("home.projectReadinessTools.checkStepCodeRequirementsScreen.whenDescription")}</Text>

        <Heading as="h2" size="lg" mt={16}>
          {t("home.projectReadinessTools.checkStepCodeRequirementsScreen.whatToExpectTitle")}
        </Heading>
        <Text mt={4}>{t("home.projectReadinessTools.checkStepCodeRequirementsScreen.whatToExpectDescription")}</Text>

        <Heading as="h3" size="md" mt={8}>
          {t("home.projectReadinessTools.checkStepCodeRequirementsScreen.whatsIncludedTitle")}
        </Heading>
        <UnorderedList mt={4} spacing={2}>
          <ListItem>{t("home.projectReadinessTools.checkStepCodeRequirementsScreen.whatsIncludedPoint1")}</ListItem>
          <ListItem>{t("home.projectReadinessTools.checkStepCodeRequirementsScreen.whatsIncludedPoint2")}</ListItem>
        </UnorderedList>
        <RouterLink to="#" color="text.link">
          {t("home.projectReadinessTools.checkStepCodeRequirementsScreen.downloadSampleLink")}
        </RouterLink>
      </Box>
    </Container>
  )
}
