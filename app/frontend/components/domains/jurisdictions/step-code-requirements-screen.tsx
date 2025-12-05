import { Button, Container, Heading, HStack, Link, Text, VStack } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useJurisdiction } from "../../../hooks/resources/use-jurisdiction"
import { useMst } from "../../../setup/root"
import { ErrorScreen } from "../../shared/base/error-screen"
import { LoadingScreen } from "../../shared/base/loading-screen"
import { StepCodeRequirementsTable } from "../../shared/step-code-requirements-table"

export const JurisdictionStepCodeRequirementsScreen = observer(() => {
  const { jurisdictionStore } = useMst()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { currentJurisdiction, error } = useJurisdiction()
  const [searchParams] = useSearchParams()
  const addressSearched = searchParams.get("address")

  const handleCheckAnotherAddress = () => {
    navigate("/project-readiness-tools/look-up-step-codes-requirements-for-your-project/")
  }

  if (error) return <ErrorScreen error={error} />

  if (!currentJurisdiction) {
    return <LoadingScreen />
  }

  return (
    <>
      <Container maxW="container.lg" py={12}>
        <Heading as="h1" mb={4}>
          {t("home.projectReadinessTools.lookUpStepCodesRequirementsForYourProjectScreen.stepCodeRequirementsFor")}{" "}
          {currentJurisdiction.qualifiedName}
        </Heading>

        <Text fontSize="md" color="text.primary" mb={6}>
          {t(
            "home.projectReadinessTools.lookUpStepCodesRequirementsForYourProjectScreen.stepCodeRequirementsDescription"
          )}
        </Text>

        <VStack align="start" spacing={1} mb={6}>
          <Text fontSize="md">
            {t("home.projectReadinessTools.lookUpStepCodesRequirementsForYourProjectScreen.jurisdiction")}:{" "}
            {currentJurisdiction.qualifiedName}
          </Text>
          {addressSearched && (
            <Text fontSize="md">
              {t("home.projectReadinessTools.lookUpStepCodesRequirementsForYourProjectScreen.addressSearched")}:{" "}
              {addressSearched}
            </Text>
          )}
        </VStack>

        <StepCodeRequirementsTable currentJurisdiction={currentJurisdiction} />

        <HStack spacing={4} mt={6}>
          <Button variant="outline" onClick={handleCheckAnotherAddress}>
            {t("home.projectReadinessTools.lookUpStepCodesRequirementsForYourProjectScreen.checkAnotherAddress")}
          </Button>
          {/* Disabled: start permit application CTA */}
        </HStack>

        <VStack align="start" spacing={4} mt={12}>
          <Heading as="h2" fontSize="2xl">
            {t("home.projectReadinessTools.lookUpStepCodesRequirementsForYourProjectScreen.generateStepCodesReport")}
          </Heading>
          <Text>
            {t(
              "home.projectReadinessTools.lookUpStepCodesRequirementsForYourProjectScreen.generateStepCodesReportDescription"
            )}{" "}
            <Link
              href="/project-readiness-tools/check-step-code-requirements/"
              color="text.link"
              textDecoration="underline"
              _hover={{ textDecoration: "none" }}
              isExternal
            >
              {t(
                "home.projectReadinessTools.lookUpStepCodesRequirementsForYourProjectScreen.checkIfYourProjectMeetsBCsStepCodesRequirements"
              )}
            </Link>
          </Text>
        </VStack>
      </Container>
    </>
  )
})
