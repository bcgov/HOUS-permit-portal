import { Button, Container, Heading, HStack, Link, ListItem, Text, UnorderedList, VStack } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useJurisdiction } from "../../../hooks/resources/use-jurisdiction"
import { ErrorScreen } from "../../shared/base/error-screen"
import { LoadingScreen } from "../../shared/base/loading-screen"
import { Part3StepCodeRequirements } from "../../shared/part3-step-code-requirements"
import { StepCodeRequirementsTable } from "../../shared/step-code-requirements-table"

type TI18nPrefix = "home.projectReadinessTools.lookUpStepCodesRequirementsForYourProjectScreen"
const i18nPrefix: TI18nPrefix = "home.projectReadinessTools.lookUpStepCodesRequirementsForYourProjectScreen"

export const JurisdictionStepCodeRequirementsScreen = observer(() => {
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

  const ActionButtons = () => (
    <HStack spacing={4}>
      <Button variant="outline" onClick={handleCheckAnotherAddress}>
        {t(`${i18nPrefix}.checkAnotherAddress`)}
      </Button>
    </HStack>
  )

  return (
    <Container maxW="container.lg" py={12}>
      <Heading as="h1" mb={4}>
        {t(`${i18nPrefix}.stepCodeRequirementsFor`)} {currentJurisdiction.qualifiedName}
      </Heading>

      <Text fontSize="md" color="text.primary" mb={2}>
        {t(`${i18nPrefix}.stepCodeRequirementsDescription`)}
      </Text>

      <Text fontSize="md" color="text.primary" mb={6}>
        {t(`${i18nPrefix}.stepCodeRequirementsNotice`)}
      </Text>

      <ActionButtons />

      {/* Part 9: Small, simple buildings */}
      <VStack align="start" spacing={4} mt={10}>
        <Heading as="h2" fontSize="2xl">
          {t(`${i18nPrefix}.smallSimpleBuildings`)}
        </Heading>
        <Text fontSize="md">{t(`${i18nPrefix}.smallSimpleBuildingsDescription`)}</Text>
        <Text fontSize="md">{t(`${i18nPrefix}.part9BuildingsAreGenerally`)}</Text>
        <UnorderedList pl={4}>
          <ListItem>{t(`${i18nPrefix}.smallSimpleBuildingsCharacteristic1`)}</ListItem>
          <ListItem>{t(`${i18nPrefix}.smallSimpleBuildingsCharacteristic2`)}</ListItem>
        </UnorderedList>
        <StepCodeRequirementsTable currentJurisdiction={currentJurisdiction} />
      </VStack>

      {/* Part 3: Large, complex buildings */}
      <VStack align="start" spacing={4} mt={10}>
        <Heading as="h2" fontSize="2xl">
          {t(`${i18nPrefix}.largeComplexBuildings`)}
        </Heading>
        <Text fontSize="md">{t(`${i18nPrefix}.largeComplexBuildingsDescription`)}</Text>
        <Text fontSize="md">{t(`${i18nPrefix}.part3BuildingsAreGenerally`)}</Text>
        <UnorderedList pl={4}>
          <ListItem>{t(`${i18nPrefix}.largeComplexBuildingsCharacteristic1`)}</ListItem>
          <ListItem>{t(`${i18nPrefix}.largeComplexBuildingsCharacteristic2`)}</ListItem>
        </UnorderedList>
        <Part3StepCodeRequirements currentJurisdiction={currentJurisdiction} />
      </VStack>

      <ActionButtons />

      <VStack align="start" spacing={4} mt={12}>
        <Heading as="h2" fontSize="2xl">
          {t(`${i18nPrefix}.generateStepCodesReport`)}
        </Heading>
        <Text>
          {t(`${i18nPrefix}.generateStepCodesReportDescription`)}{" "}
          <Link
            href="/project-readiness-tools/check-step-code-requirements/"
            color="text.link"
            textDecoration="underline"
            _hover={{ textDecoration: "none" }}
            isExternal
          >
            {t(`${i18nPrefix}.checkIfYourProjectMeetsBCsStepCodesRequirements`)}
          </Link>
        </Text>
      </VStack>
    </Container>
  )
})
