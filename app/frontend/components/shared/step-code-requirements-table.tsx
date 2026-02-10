import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Center,
  Flex,
  Grid,
  GridItem,
  Tag,
} from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { IJurisdiction } from "../../models/jurisdiction"
import { SharedSpinner } from "./base/shared-spinner"

export interface IStepCodeRequirementsTableProps {
  currentJurisdiction: IJurisdiction
}

export const StepCodeRequirementsTable: React.FC<IStepCodeRequirementsTableProps> = ({ currentJurisdiction }) => {
  const { t } = useTranslation()
  const { part9RequiredSteps } = currentJurisdiction

  if (!part9RequiredSteps) return <SharedSpinner />

  return (
    <Flex direction="column" gap={4}>
      <Accordion allowToggle defaultIndex={[0]}>
        <AccordionItem borderWidth={1} borderColor="border.light" rounded="sm">
          <AccordionButton bg="greys.grey03" fontWeight="bold">
            <Box flex="1" textAlign="left">
              {part9RequiredSteps[0].permitTypeName}
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4}>
            <>
              <Flex justify="flex-end">
                <Grid templateColumns="2fr 1fr 2fr" gap={4} w="full" color="text.secondary">
                  <GridItem textAlign="center" textTransform="uppercase" fontSize="xs">
                    {t("jurisdiction.edit.stepCode.energyStepRequired")}
                  </GridItem>
                  <GridItem textAlign="center"></GridItem>
                  <GridItem textAlign="center" textTransform="uppercase" fontSize="xs">
                    {t("jurisdiction.edit.stepCode.zeroCarbonStepRequired")}
                  </GridItem>
                  {part9RequiredSteps.map((ptrs, i) => (
                    <React.Fragment key={ptrs.id || i}>
                      <GridItem as={Center}>
                        <Tag bg="semantic.successLight" color="inherit" rounded="xs" fontWeight="bold">
                          {currentJurisdiction.energyStepRequiredTranslation(ptrs.energyStepRequired)}
                        </Tag>
                      </GridItem>
                      <GridItem as={Center} fontStyle="italic" fontWeight="bold" fontSize="sm" px={4} mx="auto">
                        {t("ui.and")}
                      </GridItem>
                      <GridItem as={Center}>
                        <Tag bg="semantic.successLight" color="inherit" rounded="xs" fontWeight="bold">
                          {currentJurisdiction.zeroCarbonLevelTranslation(ptrs.zeroCarbonStepRequired)}{" "}
                        </Tag>
                      </GridItem>
                      {i !== part9RequiredSteps.length - 1 && (
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
              </Flex>
            </>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Flex>
  )
}
