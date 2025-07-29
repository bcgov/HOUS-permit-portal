import { Box, Container, Heading, Link, Text } from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { StepCodeLookupTool } from "./step-code-lookup-tool"

export const LookUpStepCodesRequirementsForYourProjectScreen = () => {
  const { t } = useTranslation()

  return (
    <Container maxW="container.lg" pb="36" px="8">
      <Heading as="h1" mt="16" mb="6">
        {t("home.projectReadinessTools.lookUpStepCodesRequirementsForYourProjectScreen.title")}
      </Heading>
      <Text fontSize="lg" color="text.primary" mb="4">
        {t("home.projectReadinessTools.lookUpStepCodesRequirementsForYourProjectScreen.description")}
      </Text>
      <Text fontSize="lg" color="text.primary" mb="8">
        {t("home.projectReadinessTools.lookUpStepCodesRequirementsForYourProjectScreen.enterYourProjectAddress")}
      </Text>
      <StepCodeLookupTool showJurisdictionOnPage={true} />
      <Box>
        <Heading as="h2" size="lg" mb={5}>
          {t("home.projectReadinessTools.lookUpStepCodesRequirementsForYourProjectScreen.generateAStepCodesReport")}
        </Heading>
        <Text fontSize="lg">
          {t("home.projectReadinessTools.lookUpStepCodesRequirementsForYourProjectScreen.ifYoureReadyToCreateA")}{" "}
          <Link href="/project-readiness-tools/check-step-code-requirements/" color="text.link">
            {t(
              "home.projectReadinessTools.lookUpStepCodesRequirementsForYourProjectScreen.checkIfYourProjectMeetsBCsStepCodesRequirements"
            )}
          </Link>
        </Text>
      </Box>
    </Container>
  )
}
