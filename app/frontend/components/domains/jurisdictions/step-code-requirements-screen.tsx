import { Button, Container, Heading, HStack, Link, Text, VStack } from "@chakra-ui/react"
import { CaretRight } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { useNavigate, useParams } from "react-router-dom"
import { useMst } from "../../../setup/root"
import { StepCodeRequirementsTable } from "../../shared/step-code-requirements-table"

export const JurisdictionStepCodeRequirementsScreen = observer(() => {
  const { slug } = useParams()
  const { jurisdictionStore } = useMst()
  const { currentJurisdiction } = jurisdictionStore
  jurisdictionStore.setCurrentJurisdictionBySlug(slug)
  const { t } = useTranslation()
  const navigate = useNavigate()

  const handleCheckAnotherAddress = () => {
    navigate(-1)
  }

  const handleStartPermitApplication = () => {
    navigate(`/permit-applications/new`)
  }

  return (
    <>
      <Container maxW="container.lg" py={12}>
        <Heading as="h1" mb={4}>
          {t("home.projectReadinessTools.lookUpStepCodesRequirementsForYourProjectScreen.stepCodeRequirementsFor")}{" "}
          {currentJurisdiction.name}
        </Heading>

        <Text fontSize="md" color="text.primary" mb={6}>
          {t(
            "home.projectReadinessTools.lookUpStepCodesRequirementsForYourProjectScreen.stepCodeRequirementsDescription"
          )}
        </Text>

        <StepCodeRequirementsTable
          requirements={currentJurisdiction.permitTypeRequiredSteps}
          currentJurisdiction={currentJurisdiction}
        />

        <HStack spacing={4} mt={6}>
          <Button variant="outline" onClick={handleCheckAnotherAddress}>
            {t("home.projectReadinessTools.lookUpStepCodesRequirementsForYourProjectScreen.checkAnotherAddress")}
          </Button>
          <Button variant="primary" onClick={handleStartPermitApplication} rightIcon={<CaretRight size={20} />}>
            {t("home.projectReadinessTools.lookUpStepCodesRequirementsForYourProjectScreen.startPermitApplication")}
          </Button>
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
