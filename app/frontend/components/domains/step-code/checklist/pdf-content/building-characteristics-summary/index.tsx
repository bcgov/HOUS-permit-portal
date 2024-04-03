import { Text, View } from "@react-pdf/renderer"
import { t } from "i18next"
import React from "react"
import { VStack } from "../shared/v-stack"
import { styles } from "../styles"
import { DynamicCharacteristicsGrid } from "./dynamic-characteristics-grid"
import { StaticCharacteristicsGrid } from "./static-characteristics-grid"

export const BuildingCharacteristicsSummary = function StepCodeChecklistPDFBuildingCharacteristicsSummary() {
  const i18nPrefix = "stepCodeChecklist.edit.buildingCharacteristicsSummary"

  return (
    <View style={styles.panelContainer} break>
      <View style={styles.panelHeader}>
        <Text style={styles.panelHeaderText}>{t(`${i18nPrefix}.heading`)}</Text>
      </View>
      <View style={styles.panelBody}>
        <VStack style={{ spacing: 18 }}>
          <StaticCharacteristicsGrid />
          <DynamicCharacteristicsGrid />
        </VStack>
      </View>
    </View>
  )
}
