import { Flex, FormLabel, Grid, Input } from "@chakra-ui/react"
import { t } from "i18next"
import React from "react"
import { usePart3StepCode } from "../../../../../../../hooks/resources/use-part-3-step-code"
import { GridData } from "../../../../part-9/checklist/shared/grid/data"

const i18nPrefix = "stepCode.part3.stepCodeSummary.mixedUse.occupancies"

export const StepCodeOccupanciesPerformance = function MixedUseStepCodeOccupanciesPerformanceResults() {
  const { checklist } = usePart3StepCode()

  return (
    <Flex direction="column" gap={2}>
      <FormLabel>{t(`${i18nPrefix}.title`)}</FormLabel>

      <Grid templateColumns="300px repeat(2, 1fr)" borderRightWidth={1} borderColor="borders.light">
        <GridData>
          <FormLabel>{t(`${i18nPrefix}.occupancy`)}</FormLabel>
        </GridData>
        <GridData>
          <FormLabel>{t(`${i18nPrefix}.energy`)}</FormLabel>
        </GridData>
        <GridData>
          <FormLabel>{t(`${i18nPrefix}.ghgi`)}</FormLabel>
        </GridData>

        {checklist.stepCodeOccupancies.map((oc) => (
          <React.Fragment key={oc.id}>
            <GridData justifyContent="center">
              <Input isDisabled value={t(`stepCode.part3.stepCodeOccupancyKeys.${oc.key}`)} />
            </GridData>
            <GridData justifyContent="center">
              <Input
                isDisabled
                value={t(`stepCodeChecklist.edit.codeComplianceSummary.energyStepCode.steps.${oc.energyStepRequired}`)}
              />
            </GridData>
            <GridData justifyContent="center">
              <Input
                isDisabled
                value={t(
                  `stepCodeChecklist.edit.codeComplianceSummary.zeroCarbonStepCode.steps.${oc.zeroCarbonStepRequired}`
                )}
              />
            </GridData>
          </React.Fragment>
        ))}
        {checklist.baselineOccupancies.map((oc) => (
          <React.Fragment key={oc.id}>
            <GridData justifyContent="center">
              <Input isDisabled value={t(`stepCode.part3.baselineOccupancyKeys.${oc.key}`)} />
            </GridData>
            <GridData justifyContent="center">
              <Input isDisabled value={t(`stepCode.part3.performanceRequirements.${oc.performanceRequirement}`)} />
            </GridData>
            <GridData justifyContent="center">
              <Input isDisabled value={"-"} />
            </GridData>
          </React.Fragment>
        ))}
      </Grid>
    </Flex>
  )
}
