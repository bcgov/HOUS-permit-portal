import { Box, Button, Container, Flex, Heading, Tag, Text, VStack } from "@chakra-ui/react"
import { ArrowRight, CaretLeft } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import {
  IPart3Occupancy,
  IPart3OccupancyGroup,
  PART3_OCCUPANCY_GROUPS,
} from "../../../../../../constants/part3-occupancy-requirements"
import { useJurisdiction } from "../../../../../../hooks/resources/use-jurisdiction"
import { IJurisdiction } from "../../../../../../models/jurisdiction"
import { IPart3OccupancyRequiredStep } from "../../../../../../types/types"
import { ErrorScreen } from "../../../../../shared/base/error-screen"
import { LoadingScreen } from "../../../../../shared/base/loading-screen"
import { RouterLink } from "../../../../../shared/navigation/router-link"
import { i18nPrefix } from "./i18n-prefix"

type TOverviewPrefix = `${typeof i18nPrefix}.part3Overview`
const p: TOverviewPrefix = `${i18nPrefix}.part3Overview`

function formatPathwayTag(
  t: ReturnType<typeof useTranslation>["t"],
  energyStep: number,
  zeroCarbon: number | null
): string {
  const zc = zeroCarbon !== null ? `EL-${zeroCarbon}` : (t(`${p}.zeroCarbonNA`) as string)
  return t(`${p}.complianceTag`, { energyStep, zeroCarbon: zc }) as string
}

interface IOccupancyRowProps {
  occupancy: IPart3Occupancy
  configuredPathways: IPart3OccupancyRequiredStep[]
}

function OccupancyRow({ occupancy, configuredPathways }: IOccupancyRowProps) {
  const { t } = useTranslation()

  const baselineTag = formatPathwayTag(
    t,
    occupancy.provincialBaseline.energyStep,
    occupancy.provincialBaseline.zeroCarbonLevel
  )

  const pathwayCount = configuredPathways.length
  const hasConfiguredPathways = pathwayCount > 0

  return (
    <RouterLink to={occupancy.key} textDecoration="none" _hover={{ textDecoration: "none" }}>
      <Flex
        align="center"
        py={4}
        px={4}
        borderBottomWidth={1}
        borderColor="border.light"
        _hover={{ bg: "hover.blue" }}
        cursor="pointer"
      >
        <Box w="35%">
          <Text fontWeight="bold">{occupancy.name}</Text>
        </Box>
        <Box w="30%">
          <VStack align="start" spacing={1}>
            {occupancy.isConfigurable && hasConfiguredPathways ? (
              configuredPathways.map((pw) => (
                <Tag key={pw.id} size="sm" bg="greys.grey03" color="text.secondary" rounded="sm">
                  {formatPathwayTag(t, pw.energyStepRequired, pw.zeroCarbonStepRequired)}
                </Tag>
              ))
            ) : (
              <Tag size="sm" bg="greys.grey03" color="text.secondary" rounded="sm">
                {baselineTag}
              </Tag>
            )}
          </VStack>
        </Box>
        <Box flex={1}>
          {occupancy.isConfigurable ? (
            <Tag
              size="sm"
              rounded="sm"
              bg={hasConfiguredPathways ? "semantic.successLight" : "greys.grey03"}
              color={hasConfiguredPathways ? "semantic.success" : "text.secondary"}
            >
              {t(`${p}.pathwaysConfigured`, { count: pathwayCount })}
            </Tag>
          ) : (
            <Text fontSize="sm" color="text.secondary">
              {t(`${p}.alternativePathwaysNotApplicable`)}
            </Text>
          )}
        </Box>
        <Box flexShrink={0}>
          <ArrowRight size={20} color="var(--chakra-colors-text-secondary)" />
        </Box>
      </Flex>
    </RouterLink>
  )
}

function OccupancyGroupSection({ group, jurisdiction }: { group: IPart3OccupancyGroup; jurisdiction: IJurisdiction }) {
  const { t } = useTranslation()

  return (
    <Box w="full">
      <Heading as="h3" fontSize="xl" mt={6} mb={1}>
        {t(`${p}.groupLabel`, { group: group.group })}
      </Heading>
      {group.division && (
        <Text fontWeight="bold" fontSize="md" color="text.secondary" mb={4}>
          {t(`${p}.divisionLabel`, { division: group.division, description: group.classificationDescription })}
        </Text>
      )}
      {!group.division && (
        <Text fontWeight="bold" fontSize="md" color="text.secondary" mb={4}>
          {group.classificationDescription}
        </Text>
      )}

      <Box borderWidth={1} borderColor="border.light" rounded="sm" overflow="hidden">
        <Flex bg="greys.grey03" py={2} px={4} borderBottomWidth={1} borderColor="border.light" align="center">
          <Box w="35%">
            <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" color="text.secondary">
              {t(`${p}.occupancyColumnHeader`)}
            </Text>
          </Box>
          <Box w="30%">
            <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" color="text.secondary">
              {t(`${p}.compliancePathwaysColumnHeader`)}
            </Text>
          </Box>
          <Box flex={1}>
            <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" color="text.secondary">
              {t(`${p}.localOptionsColumnHeader`)}
            </Text>
          </Box>
          <Box w="20px" flexShrink={0} />
        </Flex>
        {group.occupancies.map((occ) => (
          <OccupancyRow
            key={occ.key}
            occupancy={occ}
            configuredPathways={jurisdiction.part3RequiredStepsForOccupancy(occ.key)}
          />
        ))}
      </Box>
    </Box>
  )
}

export const Part3OccupancyOverviewScreen = observer(function Part3OccupancyOverviewScreen() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { currentJurisdiction, error } = useJurisdiction()

  if (error) return <ErrorScreen error={error} />
  if (!currentJurisdiction) return <LoadingScreen />

  return (
    <Container maxW="container.lg" py={8} px={{ base: 8, xl: 0 }} flexGrow={1}>
      <VStack spacing={4} align="start" w="full">
        <Button variant="link" onClick={() => navigate(-1)} leftIcon={<CaretLeft size={20} />} textDecoration="none">
          {t("ui.back")}
        </Button>

        <Heading mb={0} fontSize="3xl">
          {t(`${i18nPrefix}.part3Title`)}
        </Heading>

        <Text color="text.secondary">{t(`${i18nPrefix}.part3Description`)}</Text>

        {PART3_OCCUPANCY_GROUPS.map((group) => (
          <OccupancyGroupSection
            key={`${group.group}-${group.division}`}
            group={group}
            jurisdiction={currentJurisdiction}
          />
        ))}
      </VStack>
    </Container>
  )
})
