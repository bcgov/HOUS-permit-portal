import { Grid } from "@chakra-ui/react"
import { t } from "i18next"
import React from "react"
import { GridColumnHeader } from "../../shared/grid/column-header"
import { i18nPrefix } from "../i18n-prefix"
import { Characteristic } from "./characteristic"

export const StaticCharacteristicsGrid = function StaticCharacteristicsGrid() {
  return (
    <Grid templateColumns={"1fr auto 1fr"}>
      <GridColumnHeader />
      <GridColumnHeader borderLeftWidth={0}>{t(`${i18nPrefix}.details`)}</GridColumnHeader>
      <GridColumnHeader borderLeftWidth={0} borderRightWidth={1}>
        {t(`${i18nPrefix}.averageRSI`)}
      </GridColumnHeader>
      <Characteristic
        fieldArrayName="buildingCharacteristicsSummaryAttributes.roofCeilingsLines"
        rowName={t(`${i18nPrefix}.roofCeilings`)}
      />
      <Characteristic
        fieldArrayName="buildingCharacteristicsSummaryAttributes.aboveGradeWallsLines"
        rowName={t(`${i18nPrefix}.aboveGradeWalls`)}
      />
      <Characteristic
        fieldArrayName="buildingCharacteristicsSummaryAttributes.framingsLines"
        rowName={t(`${i18nPrefix}.framings`)}
      />
      <Characteristic
        fieldArrayName="buildingCharacteristicsSummaryAttributes.unheatedFloorsLines"
        rowName={t(`${i18nPrefix}.unheatedFloors`)}
      />
      <Characteristic
        fieldArrayName="buildingCharacteristicsSummaryAttributes.belowGradeWallsLines"
        rowName={t(`${i18nPrefix}.belowGradeWalls`)}
      />
      <Characteristic
        fieldArrayName="buildingCharacteristicsSummaryAttributes.slabsLines"
        rowName={t(`${i18nPrefix}.slabs`)}
        isLast
      />
    </Grid>
  )
}
