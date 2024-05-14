import { Text } from "@react-pdf/renderer"
import { t } from "i18next"
import React from "react"
import { IStepCodeChecklist } from "../../../../../../../models/step-code-checklist"
import { theme } from "../../../../../../../styles/theme"
import { i18nPrefix } from "../../../building-characteristics-summary/i18n-prefix"
import { GridItem } from "../../shared/grid-item"
import { HStack } from "../../shared/h-stack"
import { VStack } from "../../shared/v-stack"
import { Characteristic } from "./characteristic"

interface IProps {
  checklist: IStepCodeChecklist
}
export function StaticCharacteristicsGrid({ checklist }: IProps) {
  return (
    <VStack style={{ width: "100%", borderWidth: 0.75, borderColor: theme.colors.border.light, gap: 0 }}>
      <HStack
        style={{
          width: "100%",
          alignItems: "stretch",
          backgroundColor: theme.colors.greys.grey03,
          borderBottomWidth: 0.75,
          borderColor: theme.colors.border.light,
          gap: 0,
        }}
      >
        <GridItem style={{ flexBasis: "25%", maxWidth: "25%" }}></GridItem>
        <GridItem
          style={{
            flexBasis: "50%",
            maxWidth: "50%",
            textAlign: "center",
          }}
        >
          <Text style={{ fontSize: 10.5 }}>{t(`${i18nPrefix}.details`)}</Text>
        </GridItem>
        <GridItem
          style={{
            flexBasis: "25%",
            maxWidth: "25%",
            textAlign: "center",
            borderRightWidth: 0,
          }}
        >
          <Text style={{ fontSize: 10.5 }}>{t(`${i18nPrefix}.averageRSI`)}</Text>
        </GridItem>
      </HStack>

      <Characteristic
        lines={checklist.buildingCharacteristicsSummary.roofCeilingsLines}
        rowName={t(`${i18nPrefix}.roofCeilings`)}
      />
      <Characteristic
        lines={checklist.buildingCharacteristicsSummary.aboveGradeWallsLines}
        rowName={t(`${i18nPrefix}.aboveGradeWalls`)}
      />
      <Characteristic
        lines={checklist.buildingCharacteristicsSummary.framingsLines}
        rowName={t(`${i18nPrefix}.framings`)}
      />
      <Characteristic
        lines={checklist.buildingCharacteristicsSummary.unheatedFloorsLines}
        rowName={t(`${i18nPrefix}.unheatedFloors`)}
      />
      <Characteristic
        lines={checklist.buildingCharacteristicsSummary.belowGradeWallsLines}
        rowName={t(`${i18nPrefix}.belowGradeWalls`)}
      />
      <Characteristic
        lines={checklist.buildingCharacteristicsSummary.slabsLines}
        rowName={t(`${i18nPrefix}.slabs`)}
        isLast
      />
    </VStack>
  )
}
