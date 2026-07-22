import {
  Box,
  Button,
  Container,
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
import { format } from "date-fns"
import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useLocation, useNavigate, useSearchParams } from "react-router-dom"
import { useJurisdiction } from "../../../hooks/resources/use-jurisdiction"
import { EClimateZone } from "../../../types/enums"
import { ErrorScreen } from "../../shared/base/error-screen"
import { LoadingScreen } from "../../shared/base/loading-screen"
import { Part3StepCodeRequirements } from "../../shared/part3-step-code-requirements"
import { StepCodeRequirementsTable } from "../../shared/step-code-requirements-table"

const requirementsUpdatedAtDateFormat = "MMMM d, yyyy"

type TI18nPrefix = "home.projectReadinessTools.lookUpStepCodesRequirementsForYourProjectScreen"
const i18nPrefix: TI18nPrefix = "home.projectReadinessTools.lookUpStepCodesRequirementsForYourProjectScreen"
const HDD_SECTION_ID = "heating-degree-days"
const climateZoneLabelKeys = {
  [EClimateZone.zone4]: `${i18nPrefix}.climateZoneLabels.zone4`,
  [EClimateZone.zone5]: `${i18nPrefix}.climateZoneLabels.zone5`,
  [EClimateZone.zone6]: `${i18nPrefix}.climateZoneLabels.zone6`,
  [EClimateZone.zone7a]: `${i18nPrefix}.climateZoneLabels.zone7a`,
  [EClimateZone.zone7b]: `${i18nPrefix}.climateZoneLabels.zone7b`,
  [EClimateZone.zone8]: `${i18nPrefix}.climateZoneLabels.zone8`,
} as const

export const JurisdictionStepCodeRequirementsScreen = observer(() => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { currentJurisdiction, error } = useJurisdiction()
  const [searchParams] = useSearchParams()
  const addressSearched = searchParams.get("address")

  useEffect(() => {
    if (!currentJurisdiction || location.hash !== `#${HDD_SECTION_ID}`) return

    // Content mounts after jurisdiction fetch; defer scroll until the section exists.
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(HDD_SECTION_ID)?.scrollIntoView({ behavior: "smooth", block: "start" })
    })

    return () => window.cancelAnimationFrame(frame)
  }, [currentJurisdiction, location.hash])

  const handleCheckAnotherAddress = () => {
    navigate("/project-readiness-tools/look-up-step-codes-requirements-for-your-project/")
  }

  if (error) return <ErrorScreen error={error} />

  if (!currentJurisdiction) {
    return <LoadingScreen />
  }

  const heatingDegreeDays = [...currentJurisdiction.jurisdictionHeatingDegreeDays]

  const requirementsLastUpdatedLabel = (date: Date | null) =>
    t(`${i18nPrefix}.requirementsLastUpdated`, {
      date: date
        ? format(date, requirementsUpdatedAtDateFormat)
        : t(`${i18nPrefix}.requirementsLastUpdatedNotAvailable`),
    })

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

      <ActionButtons />

      {/* Part 9: Small, simple buildings */}
      <VStack align="start" spacing={4} mt={10}>
        <Heading as="h2" fontSize="2xl">
          {t(`${i18nPrefix}.smallSimpleBuildings`)}
        </Heading>
        <Text fontSize="sm" color="text.secondary">
          {requirementsLastUpdatedLabel(currentJurisdiction.part9StepRequirementsUpdatedAt)}
        </Text>
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
        <Text fontSize="sm" color="text.secondary">
          {requirementsLastUpdatedLabel(currentJurisdiction.part3StepRequirementsUpdatedAt)}
        </Text>
        <Text fontSize="md">{t(`${i18nPrefix}.largeComplexBuildingsDescription`)}</Text>
        <Text fontSize="md">{t(`${i18nPrefix}.part3BuildingsAreGenerally`)}</Text>
        <UnorderedList pl={4}>
          <ListItem>{t(`${i18nPrefix}.largeComplexBuildingsCharacteristic1`)}</ListItem>
          <ListItem>{t(`${i18nPrefix}.largeComplexBuildingsCharacteristic2`)}</ListItem>
        </UnorderedList>
        <Part3StepCodeRequirements currentJurisdiction={currentJurisdiction} />
      </VStack>

      <ActionButtons pt={8} />

      <VStack align="start" spacing={5} mt={10} id={HDD_SECTION_ID}>
        <Heading as="h2" fontSize="2xl">
          {t(`${i18nPrefix}.heatingDegreeDaysTitle`)}
        </Heading>
        <Text fontSize="lg">{t(`${i18nPrefix}.heatingDegreeDaysDescription`)}</Text>
        {heatingDegreeDays.length > 0 ? (
          <Box borderWidth={1} borderColor="border.light" borderRadius="sm" overflow="hidden" w="fit-content">
            <Table variant="simple" size="md">
              <Thead>
                <Tr bg="greys.grey04">
                  <Th
                    borderBottomWidth={1}
                    borderColor="border.light"
                    fontWeight="bold"
                    fontSize="sm"
                    w="220px"
                    h="46px"
                    px={4}
                  >
                    {t(`${i18nPrefix}.heatingDegreeDaysColumnHeader`)}
                  </Th>
                  <Th
                    borderBottomWidth={1}
                    borderColor="border.light"
                    fontWeight="bold"
                    fontSize="sm"
                    w="220px"
                    h="46px"
                    px={4}
                  >
                    {t(`${i18nPrefix}.climateZoneColumnHeader`)}
                  </Th>
                  <Th
                    borderBottomWidth={1}
                    borderColor="border.light"
                    fontWeight="bold"
                    fontSize="sm"
                    w="220px"
                    h="46px"
                    px={4}
                  >
                    {t(`${i18nPrefix}.locationNameColumnHeader`)}
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {heatingDegreeDays.map((row) => {
                  const climateZoneLabelKey = climateZoneLabelKeys[row.climateZone as EClimateZone]

                  return (
                    <Tr key={row.id ?? `${row.locationName}-${row.heatingDegreeDays}`}>
                      <Td borderTopWidth={1} borderColor="greys.grey02" fontSize="lg" w="220px" minH="68px" px={4}>
                        {row.heatingDegreeDays.toLocaleString()}
                      </Td>
                      <Td borderTopWidth={1} borderColor="greys.grey02" fontSize="lg" w="220px" minH="68px" px={4}>
                        {climateZoneLabelKey ? t(climateZoneLabelKey) : row.climateZone}
                      </Td>
                      <Td borderTopWidth={1} borderColor="greys.grey02" fontSize="lg" w="220px" minH="68px" px={4}>
                        {row.locationName}
                      </Td>
                    </Tr>
                  )
                })}
              </Tbody>
            </Table>
          </Box>
        ) : (
          <Box borderWidth={1} borderColor="border.light" borderRadius="sm" p={4}>
            <Text fontWeight="bold" mb={1}>
              {t(`${i18nPrefix}.noClimateZonesTitle`)}
            </Text>
            <Text color="text.secondary">{t(`${i18nPrefix}.noClimateZonesDescription`)}</Text>
          </Box>
        )}
      </VStack>

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
