import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  HStack,
  Link,
  ListItem,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  UnorderedList,
  VStack,
} from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useJurisdiction } from "../../../hooks/resources/use-jurisdiction"
import { EClimateZone } from "../../../types/enums"
import { ErrorScreen } from "../../shared/base/error-screen"
import { LoadingScreen } from "../../shared/base/loading-screen"
import { Part3StepCodeRequirements } from "../../shared/part3-step-code-requirements"
import { StepCodeRequirementsTable } from "../../shared/step-code-requirements-table"

type TI18nPrefix = "home.projectReadinessTools.lookUpStepCodesRequirementsForYourProjectScreen"
const i18nPrefix: TI18nPrefix = "home.projectReadinessTools.lookUpStepCodesRequirementsForYourProjectScreen"
const climateZoneOrder = Object.values(EClimateZone)
const climateZoneLabelKeys = {
  [EClimateZone.zone4]: `${i18nPrefix}.climateZoneLabels.zone4`,
  [EClimateZone.zone5]: `${i18nPrefix}.climateZoneLabels.zone5`,
  [EClimateZone.zone6]: `${i18nPrefix}.climateZoneLabels.zone6`,
  [EClimateZone.zone7a]: `${i18nPrefix}.climateZoneLabels.zone7a`,
  [EClimateZone.zone7b]: `${i18nPrefix}.climateZoneLabels.zone7b`,
  [EClimateZone.zone8]: `${i18nPrefix}.climateZoneLabels.zone8`,
} as const

function getClimateZoneSortIndex(climateZone: string) {
  const index = climateZoneOrder.indexOf(climateZone as EClimateZone)
  return index === -1 ? climateZoneOrder.length : index
}

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

  const climateZones = [...currentJurisdiction.jurisdictionClimateZones].sort(
    (a, b) => getClimateZoneSortIndex(a.climateZone) - getClimateZoneSortIndex(b.climateZone)
  )

  const ActionButtons = (props: React.ComponentProps<typeof HStack>) => (
    <HStack spacing={4} {...props}>
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

      <Flex
        bg="theme.blueLight"
        borderRadius="lg"
        p={6}
        mb={6}
        direction={{ base: "column", md: "row" }}
        gap={6}
        justify="space-between"
        align={{ base: "stretch", md: "center" }}
      >
        <Box maxW="2xl">
          <Heading as="h2" fontSize="xl" mb={2}>
            {t(`${i18nPrefix}.heatingDegreeDaysTitle`)}
          </Heading>
          <Text fontSize="md" color="text.primary">
            {t(`${i18nPrefix}.heatingDegreeDaysDescription`)}
          </Text>
        </Box>
        <Box
          bg="greys.white"
          borderWidth={1}
          borderColor="border.light"
          borderRadius="md"
          minW={{ base: "full", md: "360px" }}
          overflowX="auto"
        >
          {climateZones.length > 0 ? (
            <Table size="sm" variant="simple">
              <Thead bg="greys.grey03">
                <Tr>
                  <Th>{t(`${i18nPrefix}.climateZoneColumnHeader`)}</Th>
                  <Th isNumeric>{t(`${i18nPrefix}.heatingDegreeDaysColumnHeader`)}</Th>
                </Tr>
              </Thead>
              <Tbody>
                {climateZones.map((zone) => {
                  const climateZoneLabelKey = climateZoneLabelKeys[zone.climateZone as EClimateZone]

                  return (
                    <Tr key={zone.id ?? zone.climateZone}>
                      <Td fontWeight="bold">{climateZoneLabelKey ? t(climateZoneLabelKey) : zone.climateZone}</Td>
                      <Td isNumeric color={zone.heatingDegreeDays ? "text.primary" : "text.secondary"}>
                        {zone.heatingDegreeDays?.toLocaleString() ?? t(`${i18nPrefix}.heatingDegreeDaysNotConfigured`)}
                      </Td>
                    </Tr>
                  )
                })}
              </Tbody>
            </Table>
          ) : (
            <Box p={4}>
              <Text fontWeight="bold" mb={1}>
                {t(`${i18nPrefix}.noClimateZonesTitle`)}
              </Text>
              <Text color="text.secondary">{t(`${i18nPrefix}.noClimateZonesDescription`)}</Text>
            </Box>
          )}
        </Box>
      </Flex>

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

      <ActionButtons pt={8} />

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
