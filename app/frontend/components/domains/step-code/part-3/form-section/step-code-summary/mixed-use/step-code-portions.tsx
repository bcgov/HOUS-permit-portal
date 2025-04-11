import { Flex, FormLabel, Grid, Input } from "@chakra-ui/react"
import { t } from "i18next"
import React from "react"
import { usePart3StepCode } from "../../../../../../../hooks/resources/use-part-3-step-code"
import { GridData } from "../../../../part-9/checklist/shared/grid/data"

const i18nPrefix = "stepCode.part3.stepCodeSummary.mixedUse.stepCode"

export const StepCodePortionsPerformance = function MixedUseStepCodePortionsPerformanceResults() {
  const { checklist } = usePart3StepCode()
  const tediComplies = !!checklist.complianceReport.performance.complianceSummary.tedi?.stepCodePortion

  return (
    <Flex direction="column" gap={2}>
      <FormLabel>{t(`${i18nPrefix}.title`)}</FormLabel>

      <Grid
        templateColumns="160px repeat(3, 1fr)"
        borderRightWidth={1}
        borderBottomWidth={1}
        borderColor="borders.light"
      >
        <GridData>
          <FormLabel>{t(`${i18nPrefix}.requirement`)}</FormLabel>
        </GridData>
        <GridData justifyContent="center">
          <Input isDisabled value={"-"} />
        </GridData>
        <GridData justifyContent="center">
          <Input
            isDisabled
            value={checklist.complianceReport.performance.requirements.stepCodePortions.areaWeightedTotals.tedi || "-"}
          />
        </GridData>
        <GridData justifyContent="center">
          <Input isDisabled value={"-"} />
        </GridData>

        <GridData>
          <FormLabel>{t(`${i18nPrefix}.performance`)}</FormLabel>
        </GridData>
        <GridData justifyContent="center">
          <Input isDisabled value={"-"} />
        </GridData>
        <GridData justifyContent="center">
          <Input
            isDisabled
            value={checklist.complianceReport.performance.adjustedResults.tedi.stepCodePortion || "-"}
          />
        </GridData>
        <GridData justifyContent="center">
          <Input isDisabled value={"-"} />
        </GridData>

        <GridData>
          <FormLabel>{t(`${i18nPrefix}.compliance`)}</FormLabel>
        </GridData>
        <GridData justifyContent="center">
          <Input isDisabled value={"-"} />
        </GridData>
        <GridData justifyContent="center">
          <Input
            isDisabled
            _disabled={{ bg: tediComplies ? "semantic.successLight" : "semantic.errorLight" }}
            value={tediComplies ? t("ui.yes") : t("ui.no")}
          />
        </GridData>
        <GridData justifyContent="center">
          <Input isDisabled value={"-"} />
        </GridData>
      </Grid>
    </Flex>
  )
}
