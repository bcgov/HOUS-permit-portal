import { Box, Container, Heading, List, Text } from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../../setup/root"
import { RouterLinkButton } from "../../../shared/navigation/router-link-button"

export const CheckStepCodeRequirementsScreen = () => {
  const { t } = useTranslation()
  const { userStore } = useMst()
  const { currentUser } = userStore

  return (
    <Container maxW="container.lg" py={16}>
      <Box>
        <Heading as="h1">{t("projectReadinessTools.checkStepCodeRequirementsScreen.pageHeading")}</Heading>
        <Text mt={8}>{t("projectReadinessTools.checkStepCodeRequirementsScreen.toolIntro")}</Text>
        <List.Root as="ul" mt={4} gap={2}>
          <List.Item>{t("projectReadinessTools.checkStepCodeRequirementsScreen.toolPoint1")}</List.Item>
          <List.Item>{t("projectReadinessTools.checkStepCodeRequirementsScreen.toolPoint2")}</List.Item>
        </List.Root>
        <RouterLinkButton
          size="lg"
          variant="primary"
          mt={4}
          ml={4}
          to="/project-readiness-tools/check-step-code-requirements/select"
        >
          {currentUser ? t("ui.start") : t("projectReadinessTools.checkStepCodeRequirementsScreen.loginButton")}
        </RouterLinkButton>

        <Heading as="h2" size="lg" mt={8}>
          {t("projectReadinessTools.checkStepCodeRequirementsScreen.whoTitle")}
        </Heading>
        <Text mt={4}>{t("projectReadinessTools.checkStepCodeRequirementsScreen.whoDescription")}</Text>
        <List.Root as="ul" mt={4} gap={2}>
          <List.Item>{t("projectReadinessTools.checkStepCodeRequirementsScreen.whoPoint1")}</List.Item>
          <List.Item>{t("projectReadinessTools.checkStepCodeRequirementsScreen.whoPoint2")}</List.Item>
        </List.Root>

        <Heading as="h2" size="lg" mt={8}>
          {t("projectReadinessTools.checkStepCodeRequirementsScreen.whenTitle")}
        </Heading>
        <Text mt={4}>{t("projectReadinessTools.checkStepCodeRequirementsScreen.whenDescription")}</Text>

        <Heading as="h2" size="lg" mt={8}>
          {t("projectReadinessTools.checkStepCodeRequirementsScreen.whatToExpectTitle")}
        </Heading>
        <Text mt={4}>{t("projectReadinessTools.checkStepCodeRequirementsScreen.whatToExpectDescription")}</Text>

        <Heading as="h3" size="md" mt={8}>
          {t("projectReadinessTools.checkStepCodeRequirementsScreen.whatsIncludedTitle")}
        </Heading>
        <List.Root as="ul" mt={4} gap={2}>
          <List.Item>{t("projectReadinessTools.checkStepCodeRequirementsScreen.whatsIncludedPoint1")}</List.Item>
          <List.Item>{t("projectReadinessTools.checkStepCodeRequirementsScreen.whatsIncludedPoint2")}</List.Item>
        </List.Root>
        {/* <RouterLink to="#" color="text.link">
          {t("projectReadinessTools.checkStepCodeRequirementsScreen.downloadSampleLink")}
        </RouterLink> */}
      </Box>
    </Container>
  )
}
