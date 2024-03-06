import { Grid } from "@chakra-ui/react"
import { t } from "i18next"
import React from "react"
import { IStepCodeChecklist } from "../../../../../../models/step-code-checklist"
import { GridColumnHeader } from "../../shared/compliance-grid/column-header"
import { GridData } from "../../shared/compliance-grid/data"
import { RequirementsMetTag } from "../../shared/compliance-grid/requirements-met-tag"
import { GridRowHeader } from "../../shared/compliance-grid/row-header"
import { translationPrefix } from "../translation-prefix"
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
      <GridColumnHeader>{t(`${translationPrefix}.proposedMetrics`)}</GridColumnHeader>
      <GridColumnHeader>{t(`${translationPrefix}.stepRequirement`)}</GridColumnHeader>
      <GridColumnHeader>{t(`${translationPrefix}.result`)}</GridColumnHeader>
      <GridColumnHeader>{t(`${translationPrefix}.passFail`)}</GridColumnHeader>

      <ZeroCarbonStep checklist={checklist} />
      <TotalGHG checklist={checklist} />
      <CO2 checklist={checklist} />
      <Prescriptive checklist={checklist} />

      <GridRowHeader colSpan={3} fontWeight="bold">
        {t(`${translationPrefix}.requirementsMet`)}
      </GridRowHeader>
      <GridData>
        <RequirementsMetTag success={checklist.zeroCarbonRequirementsPassed} />
      </GridData>
    </Grid>
  )
}
