import { Text } from "@react-pdf/renderer"
import { t } from "i18next"
import React from "react"
import { IStepCodeChecklist } from "../../../../../../../models/step-code-checklist"
import { theme } from "../../../../../../../styles/theme"
import { i18nPrefix } from "../../../building-characteristics-summary/i18n-prefix"
import { GridItem } from "../../shared/grid-item"
import { HStack } from "../../shared/h-stack"
import { VStack } from "../../shared/v-stack"
import { Airtightness } from "./airtightness"
import { Doors } from "./doors"
import { FossilFuels } from "./fossil-fuels"
import { HotWater } from "./hot-water"
import { Other } from "./other"
import { SpaceHeatingCooling } from "./space-heating-cooling"
import { Ventilation } from "./ventilation"
import { WindowsGlazedDoors } from "./windows-glazed-doors"

interface IProps {
  checklist: IStepCodeChecklist
}

export function DynamicCharacteristicsGrid({ checklist }: IProps) {
  return (
    <VStack style={{ width: "100%", borderWidth: 0.75, borderColor: theme.colors.border.light, gap: 0 }}>
      <HStack
        style={{
          width: "100%",
          alignItems: "stretch",
          borderBottomWidth: 0.75,
          borderColor: theme.colors.border.light,
          gap: 0,
        }}
      >
        <GridItem
          style={{
            flexBasis: "50%",
            maxWidth: "50%",
            justifyContent: "flex-start",
          }}
        >
          <Text style={{ fontSize: 10.5 }}>{t(`${i18nPrefix}.details`)}</Text>
        </GridItem>
        <GridItem
          style={{
            flexBasis: "50%",
            maxWidth: "50%",
            borderRightWidth: 0,
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 10.5 }}>{t(`${i18nPrefix}.performanceValues`)}</Text>
        </GridItem>
      </HStack>
      <WindowsGlazedDoors checklist={checklist} />
      <Doors checklist={checklist} />
      <Airtightness checklist={checklist} />
      <SpaceHeatingCooling checklist={checklist} />
      <HotWater checklist={checklist} />
      <Ventilation checklist={checklist} />
      <Other checklist={checklist} />
      <FossilFuels checklist={checklist} />
    </VStack>
  )
}
