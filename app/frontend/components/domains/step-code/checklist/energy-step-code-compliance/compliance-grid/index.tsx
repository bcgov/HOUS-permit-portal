import { Grid } from "@chakra-ui/react"
import { t } from "i18next"
import React from "react"
import { IStepCodeChecklist } from "../../../../../../models/step-code-checklist"
import { GridColumnHeader } from "../../shared/grid/column-header"
import { GridData } from "../../shared/grid/data"
import { RequirementsMetTag } from "../../shared/grid/requirements-met-tag"
import { GridRowHeader } from "../../shared/grid/row-header"
import { Airtightness } from "./airtightness"
import { EnergyStep } from "./energy-step"
import { MEUI } from "./meui"
import { TEDI } from "./tedi"

interface IEnergyComplianceGridProps {
  checklist: IStepCodeChecklist
}

export const EnergyComplianceGrid = function EnergyComplianceGrid({ checklist }: IEnergyComplianceGridProps) {
  const translationPrefix = "stepCodeChecklist.edit.energyStepCodeCompliance"

  return (
    <Grid w="full" templateColumns="1fr repeat(3, 150px)" borderWidth={1} borderColor="borders.light">
      <GridColumnHeader>{t(`${translationPrefix}.proposedMetrics`)}</GridColumnHeader>
      <GridColumnHeader>{t(`${translationPrefix}.requirement`)}</GridColumnHeader>
      <GridColumnHeader>{t(`${translationPrefix}.results`)}</GridColumnHeader>
      <GridColumnHeader>{t(`${translationPrefix}.passFail`)}</GridColumnHeader>

      <EnergyStep checklist={checklist} />
      <MEUI checklist={checklist} />
      <TEDI checklist={checklist} />
      <Airtightness checklist={checklist} />

      <GridRowHeader colSpan={3} fontWeight="bold">
        {t(`${translationPrefix}.requirementsMet`)}
      </GridRowHeader>
      <GridData alignItems="center" justifyContent="center">
        <RequirementsMetTag success={checklist.energyRequirementsPassed} />
      </GridData>
    </Grid>
  )
}
