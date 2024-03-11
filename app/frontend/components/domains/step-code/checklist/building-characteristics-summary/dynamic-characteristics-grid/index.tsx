import { Grid } from "@chakra-ui/react"
import { t } from "i18next"
import React from "react"
import { RowHeader } from "../row-header"
import { translationPrefix } from "../translation-prefix"
import { Airtightness } from "./airtightness"
import { Doors } from "./doors"
import { FossilFuels } from "./fossil-fuels"
import { HotWater } from "./hot-water"
import { Other } from "./other"
import { SpaceHeatingCooling } from "./space-heating-cooling"
import { Ventilation } from "./ventilation"
import { WindowsGlazedDoors } from "./windows-glazed-doors"

export const DynamicCharacteristicsGrid = function DynamicCharacteristicsGrid({ checklist }) {
  return (
    <Grid templateColumns={"auto repeat(2, 1fr)"}>
      <RowHeader fontSize="sm">{t(`${translationPrefix}.details`)}</RowHeader>
      <RowHeader colSpan={2} borderRightWidth={1} fontSize="sm" alignItems="center">
        {t(`${translationPrefix}.performanceValues`)}
      </RowHeader>
      <WindowsGlazedDoors />
      <Doors />
      <Airtightness checklist={checklist} />
      <SpaceHeatingCooling />
      <HotWater />
      <Ventilation />
      <Other />
      <FossilFuels />
    </Grid>
  )
}
