import { Field, Grid, GridItem, Input } from "@chakra-ui/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React from "react"
import { Trans } from "react-i18next"
import { usePart3StepCode } from "../../../../../../../../hooks/resources/use-part-3-step-code"
import { roundMetric } from "../../../../../../../../utils/utility-functions"
import { GridData } from "../../../../../part-9/checklist/shared/grid/data"

export const BaselineWholeBuildingSummary = observer(function BaselineWholeBuildingSummary() {
  const { checklist } = usePart3StepCode()
  const { requirements, adjustedResults, complianceSummary } = checklist.complianceReport.performance
  const requirement = requirements.wholeBuilding.totalEnergy
  const performance = adjustedResults.totalEnergy
  const isCompliant = !!complianceSummary.totalEnergy
  const i18nPrefix = "stepCode.part3.stepCodeSummary.mixedUse.wholeBuilding"

  return (
    <Grid templateColumns="300px 1fr" borderRightWidth={1} borderBottomWidth={1} borderColor="borders.light">
      <GridItem />
      <GridData>
        <Field.Root>
          <Field.Label m={0}>{t("stepCode.part3.metrics.totalEnergy.label")}</Field.Label>
          <Field.HelperText mt={0}>
            <Trans i18nKey={"stepCode.part3.metrics.totalEnergy.units"} components={{ sup: <sup />, sub: <sub /> }} />
          </Field.HelperText>
        </Field.Root>
      </GridData>
      <GridData>
        <Field.Label>{t(`${i18nPrefix}.requirements`)}</Field.Label>
      </GridData>
      <GridData justifyContent="center">
        <Input disabled value={roundMetric(requirement)} />
      </GridData>
      <GridData>
        <Field.Label>{t(`${i18nPrefix}.performance`)}</Field.Label>
      </GridData>
      <GridData justifyContent="center">
        <Input disabled value={roundMetric(performance)} />
      </GridData>
      <GridData>
        <Field.Label>{t(`${i18nPrefix}.compliance`)}</Field.Label>
      </GridData>
      <GridData justifyContent="center">
        <Input
          disabled
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
