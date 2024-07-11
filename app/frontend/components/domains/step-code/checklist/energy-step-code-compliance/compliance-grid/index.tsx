import { Grid } from "@chakra-ui/react"
import { t } from "i18next"
import React from "react"
import { IStepCodeEnergyComplianceReport } from "../../../../../../models/step-code-energy-compliance-report"
import { GridColumnHeader } from "../../shared/grid/column-header"
import { GridData } from "../../shared/grid/data"
import { RequirementsMetTag } from "../../shared/grid/requirements-met-tag"
import { GridRowHeader } from "../../shared/grid/row-header"
import { i18nPrefix } from "../i18n-prefix"
import { Airtightness } from "./airtightness"
import { EnergyStep } from "./energy-step"
import { MEUI } from "./meui"
import { TEDI } from "./tedi"

interface IEnergyComplianceGridProps {
  compliance: IStepCodeEnergyComplianceReport
}

export const EnergyComplianceGrid = function EnergyComplianceGrid({ compliance }: IEnergyComplianceGridProps) {
  return (
    <Grid w="full" templateColumns="1fr repeat(3, 150px)" borderWidth={1} borderColor="borders.light">
      <GridColumnHeader>{t(`${i18nPrefix}.proposedMetrics`)}</GridColumnHeader>
      <GridColumnHeader>{t(`${i18nPrefix}.requirement`)}</GridColumnHeader>
      <GridColumnHeader>{t(`${i18nPrefix}.results`)}</GridColumnHeader>
      <GridColumnHeader>{t(`${i18nPrefix}.passFail`)}</GridColumnHeader>

      <EnergyStep compliance={compliance} />
      <MEUI compliance={compliance} />
      <TEDI compliance={compliance} />
      <Airtightness compliance={compliance} />

      <GridRowHeader colSpan={3} fontWeight="bold">
        {t(`${i18nPrefix}.requirementsMet`)}
      </GridRowHeader>
      <GridData alignItems="center" justifyContent="center">
        <RequirementsMetTag success={compliance.requirementsPassed} />
      </GridData>
    </Grid>
  )
}
