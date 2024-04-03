import { Text, View } from "@react-pdf/renderer"
import { t } from "i18next"
import React, { useContext } from "react"
import { i18nPrefix } from "../../energy-step-code-compliance/i18n-prefix"
import { Field } from "../shared/field"
import { HStack } from "../shared/h-stack"
import { VStack } from "../shared/v-stack"
import { StepCodeChecklistContext } from "../step-code-checklist-context"
import { styles } from "../styles"
import { EnergyComplianceGrid } from "./compliance-grid"
import { OtherData } from "./other-data"

export const EnergyStepCompliance = function StepCodeChecklistPDFEnergyStepCompliance() {
  const { checklist } = useContext(StepCodeChecklistContext)

  return (
    <View style={{ ...styles.panelContainer, marginTop: 18 }}>
      <View style={styles.panelHeader}>
        <Text style={styles.panelHeaderText}>{t(`${i18nPrefix}.heading`)}</Text>
      </View>
      <View style={styles.panelBody}>
        <HStack style={{ width: "100%", alignItems: "flex-end" }}>
          <Field
            value={checklist.energyTarget}
            hint={t(`${i18nPrefix}.consumptionUnit`)}
            label={t(`${i18nPrefix}.proposedConsumption`)}
          />
          <Field
            label={t(`${i18nPrefix}.refConsumption`)}
            value={checklist.refEnergyTarget}
            hint={t(`${i18nPrefix}.consumptionUnit`)}
          />
        </HStack>

        <VStack style={{ spacing: 18 }}>
          <EnergyComplianceGrid />
          <OtherData />
        </VStack>
      </View>
    </View>
  )
}
