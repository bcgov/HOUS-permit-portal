import { Accordion, Box, Center, Flex, Grid, GridItem, Heading, Tag, Text } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import {
  IPart3Occupancy,
  IPart3OccupancyGroup,
  PART3_OCCUPANCY_GROUPS,
} from "../../constants/part3-occupancy-requirements"
import { IJurisdiction } from "../../models/jurisdiction"
import { IPart3OccupancyRequiredStep } from "../../types/types"

interface IPart3StepCodeRequirementsProps {
  currentJurisdiction: IJurisdiction
}

const i18nPrefix = "home.configurationManagement.stepCodeRequirements" as const

function formatEnergyStep(step: number): string {
  return String(step)
}

function formatZeroCarbonLevel(level: number | null): string {
  if (level == null) return "N/A"
  const labels: Record<number, string> = {
    1: "EL 1 - Measure Only",
    2: "EL 2 - Moderate",
    3: "EL 3 - Strong",
    4: "EL 4 - Zero Carbon",
  }
  return labels[level] ?? `EL ${level}`
}

function getDisplayPathways(
  occupancy: IPart3Occupancy,
  jurisdiction: IJurisdiction
): Array<{ energyStep: string; zeroCarbonLevel: string }> {
  if (occupancy.isConfigurable) {
    const configured = jurisdiction.part3RequiredStepsForOccupancy(occupancy.key)
    if (configured.length > 0) {
      return configured.map((p: IPart3OccupancyRequiredStep) => ({
        energyStep: formatEnergyStep(p.energyStepRequired),
        zeroCarbonLevel: formatZeroCarbonLevel(p.zeroCarbonStepRequired),
      }))
    }
  }

  return [
    {
      energyStep: formatEnergyStep(occupancy.provincialBaseline.energyStep),
      zeroCarbonLevel: formatZeroCarbonLevel(occupancy.provincialBaseline.zeroCarbonLevel),
    },
  ]
}

const OccupancyAccordionItem = observer(
  ({ occupancy, jurisdiction }: { occupancy: IPart3Occupancy; jurisdiction: IJurisdiction }) => {
    const { t } = useTranslation()
    const pathways = getDisplayPathways(occupancy, jurisdiction)

    return (
      <Accordion.Item borderWidth={1} borderColor="border.light" rounded="sm" minW="30%" value="item-0">
        <Accordion.ItemTrigger bg="greys.grey03" fontWeight="bold">
          <Box flex="1" textAlign="left">
            {occupancy.name}
          </Box>
          <Accordion.ItemIndicator />
        </Accordion.ItemTrigger>
        <Accordion.ItemContent pb={4}>
          <Accordion.ItemBody>
            <Grid templateColumns="2fr 1fr 2fr" gap={4} w="full" color="text.secondary">
              <GridItem textAlign="center" textTransform="uppercase" fontSize="xs">
                {t("jurisdiction.edit.stepCode.energyStepRequired")}
              </GridItem>
              <GridItem textAlign="center" />
              <GridItem textAlign="center" textTransform="uppercase" fontSize="xs">
                {t("jurisdiction.edit.stepCode.zeroCarbonStepRequired")}
              </GridItem>
              {pathways.map((pw, i) => (
                <React.Fragment key={i}>
                  <GridItem asChild>
                    <Center>
                      <Tag.Root bg="semantic.successLight" color="inherit" rounded="xs" fontWeight="bold">
                        {pw.energyStep}
                      </Tag.Root>
                    </Center>
                  </GridItem>
                  <GridItem fontStyle="italic" fontWeight="bold" fontSize="sm" px={4} mx="auto" asChild>
                    <Center>{t("ui.and")}</Center>
                  </GridItem>
                  <GridItem asChild>
                    <Center>
                      <Tag.Root bg="semantic.successLight" color="inherit" rounded="xs" fontWeight="bold">
                        {pw.zeroCarbonLevel}
                      </Tag.Root>
                    </Center>
                  </GridItem>
                  {i !== pathways.length - 1 && (
                    <GridItem
                      colSpan={3}
                      textTransform="uppercase"
                      bg="theme.blueLight"
                      fontStyle="italic"
                      color="text.link"
                      fontSize="sm"
                      px={2}
                      py={1}
                    >
                      {t("ui.or")}
                    </GridItem>
                  )}
                </React.Fragment>
              ))}
            </Grid>
          </Accordion.ItemBody>
        </Accordion.ItemContent>
      </Accordion.Item>
    )
  }
)

const OccupancyGroupSection = observer(
  ({ group, jurisdiction }: { group: IPart3OccupancyGroup; jurisdiction: IJurisdiction }) => {
    const { t } = useTranslation()

    return (
      <Flex direction="column" gap={2} w="full">
        <Heading as="h4" fontSize="lg" color="theme.blueAlt" mt={4}>
          {t(`${i18nPrefix}.part3Public.groupLabel`, { group: group.group })}
        </Heading>
        {group.division != null && (
          <Text fontSize="sm" fontWeight="bold" color="text.secondary">
            {t(`${i18nPrefix}.part3Public.divisionLabel`, {
              division: group.division,
              description: group.classificationDescription,
            })}
          </Text>
        )}
        {group.division == null && (
          <Text fontSize="sm" fontWeight="bold" color="text.secondary">
            {group.classificationDescription}
          </Text>
        )}
        <Accordion.Root collapsible>
          {group.occupancies.map((occ) => (
            <OccupancyAccordionItem key={occ.key} occupancy={occ} jurisdiction={jurisdiction} />
          ))}
        </Accordion.Root>
      </Flex>
    )
  }
)

export const Part3StepCodeRequirements: React.FC<IPart3StepCodeRequirementsProps> = observer(
  ({ currentJurisdiction }) => {
    return (
      <Flex direction="column" gap={2} w="50%">
        {PART3_OCCUPANCY_GROUPS.map((group) => (
          <OccupancyGroupSection
            key={`${group.group}-${group.division ?? "none"}`}
            group={group}
            jurisdiction={currentJurisdiction}
          />
        ))}
      </Flex>
    )
  }
)
