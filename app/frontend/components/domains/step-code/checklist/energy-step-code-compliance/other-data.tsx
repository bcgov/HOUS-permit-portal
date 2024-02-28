import { Grid } from "@chakra-ui/react"
import { t } from "i18next"
import React from "react"
import { IStepCodeChecklist } from "../../../../../models/step-code-checklist"
import { GridColumnHeader } from "../shared/compliance-grid/column-header"
import { GridData } from "../shared/compliance-grid/data"
import { GridRowHeader } from "../shared/compliance-grid/row-header"
import { translationPrefix } from "./translation-prefix"

interface IProps {
  checklist: IStepCodeChecklist
}

export const OtherData = function EnergyStepCodeComplianceOtherData({ checklist }: IProps) {
  return (
    <Grid templateColumns={"repeat(1fr, 2)"}>
      <GridColumnHeader colSpan={2}>{t(`${translationPrefix}.otherData.header`)}</GridColumnHeader>
      <GridRowHeader>{t(`${translationPrefix}.otherData.software`)}</GridRowHeader>
      <GridData>{checklist.softwareName}</GridData>
      <GridRowHeader>{t(`${translationPrefix}.otherData.softwareVersion`)}</GridRowHeader>
      <GridData>{checklist.softwareVersion}</GridData>
      <GridRowHeader>{t(`${translationPrefix}.otherData.heatedFloorArea`)}</GridRowHeader>
      <GridData>{checklist.totalHeatedFloorArea}</GridData>
      <GridRowHeader>{t(`${translationPrefix}.otherData.volume`)}</GridRowHeader>
      <GridData>{checklist.volume}</GridData>
      <GridRowHeader>{t(`${translationPrefix}.otherData.surfaceArea`)}</GridRowHeader>
      <GridData>{checklist.surfaceArea}</GridData>
      <GridRowHeader>{t(`${translationPrefix}.otherData.fwdr`)}</GridRowHeader>
      <GridData>{checklist.fwdr}</GridData>
      <GridRowHeader>{t(`${translationPrefix}.otherData.climateLocation`)}</GridRowHeader>
      <GridData>{checklist.location}</GridData>
      <GridRowHeader>{t(`${translationPrefix}.otherData.hdd`)}</GridRowHeader>
      <GridData>{checklist.heatingDegreeDays}</GridData>
      <GridRowHeader>{t(`${translationPrefix}.otherData.spaceCooled`)}</GridRowHeader>
      <GridData>{checklist.conditionedPercent}</GridData>
    </Grid>
  )
}
