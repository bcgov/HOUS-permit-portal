import { Grid } from "@chakra-ui/react"
import { t } from "i18next"
import React from "react"
import { IStepCodeZeroCarbonComplianceReport } from "../../../../../../models/step-code-zero-carbon-compliance-report"
import { GridColumnHeader } from "../../shared/grid/column-header"
import { GridData } from "../../shared/grid/data"
import { RequirementsMetTag } from "../../shared/grid/requirements-met-tag"
import { GridRowHeader } from "../../shared/grid/row-header"
import { i18nPrefix } from "../i18n-prefix"
import { CO2 } from "./co2"
import { Prescriptive } from "./prescriptive"
import { TotalGHG } from "./total-ghg"
import { ZeroCarbonStep } from "./zero-carbon-step"

interface IProps {
  compliance: IStepCodeZeroCarbonComplianceReport
}

export const ZeroCarbonComplianceGrid = function ZeroCarbonComplianceGrid({ compliance }: IProps) {
  return (
    <Grid w="full" templateColumns="1fr repeat(3, 150px)" borderWidth={1} borderColor="borders.light">
      <GridColumnHeader>{t(`${i18nPrefix}.proposedMetrics`)}</GridColumnHeader>
      <GridColumnHeader>{t(`${i18nPrefix}.stepRequirement`)}</GridColumnHeader>
      <GridColumnHeader>{t(`${i18nPrefix}.result`)}</GridColumnHeader>
      <GridColumnHeader>{t(`${i18nPrefix}.passFail`)}</GridColumnHeader>

      <ZeroCarbonStep compliance={compliance} />
      <TotalGHG compliance={compliance} />
      <CO2 compliance={compliance} />
      <Prescriptive compliance={compliance} />

      <GridRowHeader colSpan={3} fontWeight="bold">
        {t(`${i18nPrefix}.requirementsMet`)}
      </GridRowHeader>
      <GridData alignItems="center" justifyContent="center">
        <RequirementsMetTag success={compliance.requirementsPassed} />
      </GridData>
    </Grid>
  )
}
