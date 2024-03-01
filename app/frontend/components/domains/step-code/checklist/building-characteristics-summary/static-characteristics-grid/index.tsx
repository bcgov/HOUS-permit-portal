import { Grid } from "@chakra-ui/react"
import { t } from "i18next"
import React from "react"
import { GridColumnHeader } from "../../shared/grid/column-header"
import { translationPrefix } from "../translation-prefix"
import { Characteristic } from "./characteristic"

export const StaticCharacteristicsGrid = function StaticCharacteristicsGrid() {
  return (
    <Grid templateColumns={"1fr auto 1fr"}>
      <GridColumnHeader />
      <GridColumnHeader borderLeftWidth={0}>{t(`${translationPrefix}.details`)}</GridColumnHeader>
      <GridColumnHeader borderLeftWidth={0} borderRightWidth={1}>
        {t(`${translationPrefix}.averageRSI`)}
      </GridColumnHeader>
      <Characteristic
        fieldArrayName="buildingCharacteristicsSummaryAttributes.roofCeilingsLines"
        rowName={t(`${translationPrefix}.roofCeilings`)}
      />
      <Characteristic
        fieldArrayName="buildingCharacteristicsSummaryAttributes.aboveGradeWallsLines"
        rowName={t(`${translationPrefix}.aboveGradeWalls`)}
      />
      <Characteristic
        fieldArrayName="buildingCharacteristicsSummaryAttributes.framingsLines"
        rowName={t(`${translationPrefix}.framings`)}
      />
      <Characteristic
        fieldArrayName="buildingCharacteristicsSummaryAttributes.unheatedFloorsLines"
        rowName={t(`${translationPrefix}.unheatedFloors`)}
      />
      <Characteristic
        fieldArrayName="buildingCharacteristicsSummaryAttributes.belowGradeWallsLines"
        rowName={t(`${translationPrefix}.belowGradeWalls`)}
      />
      <Characteristic
        fieldArrayName="buildingCharacteristicsSummaryAttributes.slabsLines"
        rowName={t(`${translationPrefix}.slabs`)}
        isLast
      />
    </Grid>
  )
}
