import { Text, View } from "@react-pdf/renderer"
import { t } from "i18next"
import React from "react"
import { IPart3ComplianceReport } from "../../../../../../../types/types"
import { Input } from "../../../../part-9/checklist/pdf-content/shared/field"
import { styles } from "./styles"

interface IProps {
  requirements: IPart3ComplianceReport["performance"]["requirements"]
  compliance: IPart3ComplianceReport["performance"]["complianceSummary"]
  adjustedResults: IPart3ComplianceReport["performance"]["adjustedResults"]
}

// Define static translation keys based on the prefix structure used elsewhere
// Use 'as const' to ensure TypeScript infers literal types
const i18nKeys = {
  requirements: "stepCode.part3.stepCodeSummary.mixedUse.wholeBuilding.requirements",
  performance: "stepCode.part3.stepCodeSummary.mixedUse.wholeBuilding.performance",
  compliance: "stepCode.part3.stepCodeSummary.mixedUse.wholeBuilding.compliance",
  totalEnergyLabel: "stepCode.part3.metrics.totalEnergy.label",
  totalEnergyUnits: "stepCode.part3.metrics.totalEnergy.units",
} as const

export const BaselineWholeBuildingPdf = ({ requirements, compliance, adjustedResults }: IProps) => {
  const requirementValue = requirements?.wholeBuilding?.totalEnergy
  const performanceValue = adjustedResults?.totalEnergy
  const isCompliant = !!compliance?.totalEnergy

  const formatValue = (value: string | number | undefined | null) =>
    value != null && !isNaN(Number(value)) ? Number(value).toFixed(2) : "-"

  return (
    <View style={styles.table}>
      {/* Header Row - Label in Second Column */}
      <View style={styles.tableRow}>
        {/* First Column: Empty (for row labels) (flex: 2) */}
        <View style={{ ...styles.tableCell, ...styles.tableHeaderCell, flex: 2 }}>
          <Text> </Text> {/* Empty cell for alignment */}
        </View>
        {/* Second Column: Value Header (Label and Units) (flex: 1) */}
        <View style={{ ...styles.tableCell, ...styles.tableHeaderCell, flex: 1 }}>
          <Text>{t(i18nKeys.totalEnergyLabel)}</Text>
          <Text style={styles.smallText}>{t(i18nKeys.totalEnergyUnits)}</Text>
        </View>
      </View>
      {/* Requirements Row */}
      <View style={styles.tableRow}>
        <View style={{ ...styles.tableCell, flex: 2, textAlign: "left" }}>
          <Text>{t(i18nKeys.requirements)}</Text>
        </View>
        <View style={{ ...styles.tableCell, flex: 1 }}>
          <Input value={formatValue(requirementValue)} inputStyles={styles.inputStyle} />
        </View>
      </View>
      {/* Performance Row */}
      <View style={styles.tableRow}>
        <View style={{ ...styles.tableCell, flex: 2, textAlign: "left" }}>
          <Text>{t(i18nKeys.performance)}</Text>
        </View>
        <View style={{ ...styles.tableCell, flex: 1 }}>
          <Input value={formatValue(performanceValue)} inputStyles={styles.inputStyle} />
        </View>
      </View>
      {/* Compliance Row */}
      <View style={styles.tableRow}>
        <View style={{ ...styles.tableCell, flex: 2, textAlign: "left" }}>
          <Text>{t(i18nKeys.compliance)}</Text>
        </View>
        <View style={{ ...styles.tableCell, flex: 1 }}>
          <Input
            // isDisabled removed as it's not supported
            // Applying conditional styling directly might be complex in react-pdf, keeping it simple
            value={isCompliant ? t("ui.yes") : t("ui.no")}
            inputStyles={{
              ...styles.inputStyle,
              // Basic color indication - may need theme access for exact match
              backgroundColor: isCompliant ? "#D4F3E2" /* approx successLight */ : "#FEEBEB" /* approx errorLight */,
            }}
          />
        </View>
      </View>
    </View>
  )
}
