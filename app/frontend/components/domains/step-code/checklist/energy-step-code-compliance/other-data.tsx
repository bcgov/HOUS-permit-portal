import { Grid } from "@chakra-ui/react"
import { t } from "i18next"
import React from "react"
import { IStepCodeChecklist } from "../../../../../models/step-code-checklist"
import { GridColumnHeader } from "../shared/grid/column-header"
import { GridData } from "../shared/grid/data"
import { GridRowHeader } from "../shared/grid/row-header"
import { i18nPrefix } from "./i18n-prefix"

interface IProps {
  checklist: IStepCodeChecklist
}

export const OtherData = function EnergyStepCodeComplianceOtherData({ checklist }: IProps) {
  return (
    <Grid templateColumns={"repeat(1fr, 2)"}>
      <GridColumnHeader colSpan={2} borderRightWidth={1}>
        {t(`${i18nPrefix}.otherData.header`)}
      </GridColumnHeader>
      <GridRowHeader>{t(`${i18nPrefix}.otherData.software`)}</GridRowHeader>
      <GridData borderRightWidth={1}>{checklist.softwareName}</GridData>
      <GridRowHeader>{t(`${i18nPrefix}.otherData.softwareVersion`)}</GridRowHeader>
      <GridData borderRightWidth={1}>{checklist.softwareVersion}</GridData>
      <GridRowHeader>{t(`${i18nPrefix}.otherData.heatedFloorArea`)}</GridRowHeader>
      <GridData borderRightWidth={1}>{checklist.totalHeatedFloorArea}</GridData>
      <GridRowHeader>{t(`${i18nPrefix}.otherData.volume`)}</GridRowHeader>
      <GridData borderRightWidth={1}>{checklist.volume}</GridData>
      <GridRowHeader>{t(`${i18nPrefix}.otherData.surfaceArea`)}</GridRowHeader>
      <GridData borderRightWidth={1}>{checklist.surfaceArea}</GridData>
      <GridRowHeader>{t(`${i18nPrefix}.otherData.fwdr`)}</GridRowHeader>
      <GridData borderRightWidth={1}>{checklist.fwdr}</GridData>
      <GridRowHeader>{t(`${i18nPrefix}.otherData.climateLocation`)}</GridRowHeader>
      <GridData borderRightWidth={1}>{checklist.location}</GridData>
      <GridRowHeader>{t(`${i18nPrefix}.otherData.hdd`)}</GridRowHeader>
      <GridData borderRightWidth={1}>{checklist.heatingDegreeDays}</GridData>
      <GridRowHeader borderBottomWidth={1}>{t(`${i18nPrefix}.otherData.spaceCooled`)}</GridRowHeader>
      <GridData borderRightWidth={1} borderBottomWidth={1}>
        {checklist.conditionedPercent}
      </GridData>
    </Grid>
  )
}
