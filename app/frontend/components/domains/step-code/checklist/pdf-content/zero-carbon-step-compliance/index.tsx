import { Text, View } from "@react-pdf/renderer"
import { t } from "i18next"
import React from "react"
import { IStepCodeChecklist } from "../../../../../../models/step-code-checklist"
import { i18nPrefix } from "../../zero-carbon-step-code-compliance/i18n-prefix"
import { styles } from "../styles"
import { ZeroCarbonComplianceGrid } from "./compliance-grid"

interface IProps {
  checklist: IStepCodeChecklist
}

export const ZeroCarbonStepCompliance = function StepCodeChecklistPDFZeroCarbonStepCompliance({ checklist }: IProps) {
  return (
    <View style={styles.panelContainer} break>
      <View style={styles.panelHeader}>
        <Text style={styles.panelHeaderText}>{t(`${i18nPrefix}.heading`)}</Text>
      </View>
      <View style={styles.panelBody}>
        <ZeroCarbonComplianceGrid checklist={checklist} />
      </View>
    </View>
  )
}
