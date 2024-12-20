import { FormControl, FormHelperText, FormLabel, Grid, GridItem, Input } from "@chakra-ui/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React from "react"
import { Trans } from "react-i18next"
import { usePart3StepCode } from "../../../../../../../../hooks/resources/use-part-3-step-code"
import { GridData } from "../../../../../part-9/checklist/shared/grid/data"

export const BaselineWholeBuildingSummary = observer(function BaselineWholeBuildingSummary() {
  const { checklist } = usePart3StepCode()
  const { requirements, adjustedResults, complianceSummary } = checklist.complianceReport.performance
  const requirement = requirements.wholeBuilding.totalEnergy
  const performance = adjustedResults.totalEnergy
  const isCompliant = !!complianceSummary.totalEnergy
  const i18nPrefix = "stepCode.part3.stepCodeSummary.mixedUse.wholeBuilding"

  return (
    <Grid templateColumns="300px 1fr" borderRightWidth={1} borderColor="borders.light">
      <GridItem />
      <GridData>
        <FormControl>
          <FormLabel m={0}>{t("stepCode.part3.metrics.totalEnergy.label")}</FormLabel>
          <FormHelperText mt={0}>
            <Trans i18nKey={"stepCode.part3.metrics.totalEnergy.units"} components={{ sup: <sup />, sub: <sub /> }} />
          </FormHelperText>
        </FormControl>
      </GridData>

      <GridData>
        <FormLabel>{t(`${i18nPrefix}.requirements`)}</FormLabel>
      </GridData>
      <GridData justifyContent="center">
        <Input isDisabled value={requirement ? parseFloat(requirement).toFixed(2) : "-"} />
      </GridData>
      <GridData>
        <FormLabel>{t(`${i18nPrefix}.performance`)}</FormLabel>
      </GridData>
      <GridData justifyContent="center">
        <Input isDisabled value={performance ? parseFloat(performance).toFixed(2) : "-"} />
      </GridData>
      <GridData>
        <FormLabel>{t(`${i18nPrefix}.compliance`)}</FormLabel>
      </GridData>
      <GridData justifyContent="center">
        <Input
          isDisabled
          _disabled={{
            bg: isCompliant ? "semantic.successLight" : "semantic.errorLight",
            borderColor: isCompliant ? "semantic.success" : "semantic.error",
          }}
          value={isCompliant ? t("ui.yes") : t("ui.no")}
        />
      </GridData>
    </Grid>
  )
})
