import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Center,
  Divider,
  Grid,
  GridItem,
  Tag,
  Text,
  VStack,
} from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import * as R from "ramda"
import React from "react"
import { useTranslation } from "react-i18next"
import { IStepCodeRequirementsTableProps } from "../../types/types"

const i18nPrefix = "home.jurisdictions.config.stepCodeRequirements.stepRequired"

export const StepCodeRequirementsTable = observer(
  ({ requirements, currentJurisdiction }: IStepCodeRequirementsTableProps) => {
    const { t } = useTranslation()
    const groupedByPermitType = R.groupBy((r) => r.permitTypeName, requirements || [])

    return (
      <Accordion allowMultiple defaultIndex={Object.keys(groupedByPermitType).map((_, i) => i)}>
        {Object.keys(groupedByPermitType).map((permitTypeName, index) => {
          const requirementsForPermitType = groupedByPermitType[permitTypeName]
          const groupedByActivity = R.groupBy((r) => r.activityName || "", requirementsForPermitType)

          return (
            <AccordionItem key={index} borderWidth={1} borderColor="border.light" rounded="sm" mb={4}>
              <AccordionButton bg="greys.grey03" fontWeight="bold">
                <Box flex="1" textAlign="left">
                  {permitTypeName}
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4}>
                <Grid templateColumns="2fr 5fr" gap={6} w="full">
                  <GridItem>
                    <Text textTransform="uppercase" fontSize="xs" color="text.secondary">
                      {t("jurisdiction.edit.stepCode.workType")}
                    </Text>
                  </GridItem>
                  <GridItem>
                    <Grid templateColumns="repeat(3, 1fr)" gap={4}>
                      <GridItem textAlign="center" textTransform="uppercase" fontSize="xs" color="text.secondary">
                        {t("jurisdiction.edit.stepCode.energyStepRequired")}
                      </GridItem>
                      <GridItem />
                      <GridItem textAlign="center" textTransform="uppercase" fontSize="xs" color="text.secondary">
                        {t("jurisdiction.edit.stepCode.zeroCarbonStepRequired")}
                      </GridItem>
                    </Grid>
                  </GridItem>
                </Grid>

                {Object.keys(groupedByActivity).map((activityName) => {
                  const requirementsForActivity = groupedByActivity[activityName]
                  return (
                    <React.Fragment key={activityName}>
                      <Divider my={4} />
                      <Grid templateColumns="2fr 5fr" gap={6} w="full" alignItems="center">
                        <GridItem>
                          <Text>{activityName}</Text>
                        </GridItem>
                        <GridItem>
                          <VStack spacing={2} align="stretch">
                            {requirementsForActivity.map((ptrs, i) => (
                              <React.Fragment key={ptrs.id}>
                                <Grid templateColumns="repeat(3, 1fr)" gap={4} alignItems="center">
                                  <GridItem as={Center}>
                                    <Tag
                                      bg="semantic.successLight"
                                      color="inherit"
                                      rounded="sm"
                                      fontWeight="bold"
                                      p={2}
                                    >
                                      {currentJurisdiction.energyStepRequiredTranslation(ptrs.energyStepRequired)}
                                    </Tag>
                                  </GridItem>
                                  <GridItem as={Center} fontStyle="italic" fontWeight="bold" fontSize="sm">
                                    {t("ui.and")}
                                  </GridItem>
                                  <GridItem as={Center}>
                                    <Tag
                                      bg="semantic.successLight"
                                      color="inherit"
                                      rounded="sm"
                                      fontWeight="bold"
                                      p={2}
                                    >
                                      {currentJurisdiction.zeroCarbonLevelTranslation(ptrs.zeroCarbonStepRequired)}
                                    </Tag>
                                  </GridItem>
                                </Grid>
                                {i < requirementsForActivity.length - 1 && (
                                  <Box
                                    bg="theme.blueLight"
                                    color="text.link"
                                    fontSize="sm"
                                    p={2}
                                    textAlign="left"
                                    w="full"
                                    fontStyle="italic"
                                    textTransform="uppercase"
                                  >
                                    {t("ui.or")}
                                  </Box>
                                )}
                              </React.Fragment>
                            ))}
                          </VStack>
                        </GridItem>
                      </Grid>
                    </React.Fragment>
                  )
                })}
              </AccordionPanel>
            </AccordionItem>
          )
        })}
      </Accordion>
    )
  }
)
