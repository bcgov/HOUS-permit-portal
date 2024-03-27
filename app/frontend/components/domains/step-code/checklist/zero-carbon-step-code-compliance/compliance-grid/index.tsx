import { Grid } from "@chakra-ui/react"
import { t } from "i18next"
import React from "react"
import { IStepCodeChecklist } from "../../../../../../models/step-code-checklist"
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
  checklist: IStepCodeChecklist
}

export const ZeroCarbonComplianceGrid = function ZeroCarbonComplianceGrid({ checklist }: IProps) {
  return (
    <Grid w="full" templateColumns="1fr repeat(3, 150px)" borderWidth={1} borderColor="borders.light">
      <GridColumnHeader>{t(`${i18nPrefix}.proposedMetrics`)}</GridColumnHeader>
      <GridColumnHeader>{t(`${i18nPrefix}.stepRequirement`)}</GridColumnHeader>
      <GridColumnHeader>{t(`${i18nPrefix}.result`)}</GridColumnHeader>
      <GridColumnHeader>{t(`${i18nPrefix}.passFail`)}</GridColumnHeader>

      <ZeroCarbonStep checklist={checklist} />
      <TotalGHG checklist={checklist} />
      <CO2 checklist={checklist} />
      <Prescriptive checklist={checklist} />

      <GridRowHeader colSpan={3} fontWeight="bold">
        {t(`${i18nPrefix}.requirementsMet`)}
      </GridRowHeader>
      <GridData alignItems="center" justifyContent="center">
        <RequirementsMetTag success={checklist.zeroCarbonRequirementsPassed} />
      </GridData>
    </Grid>
  )
}
