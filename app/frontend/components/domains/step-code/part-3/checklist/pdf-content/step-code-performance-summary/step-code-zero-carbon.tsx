import { Text, View } from "@react-pdf/renderer"
import { t } from "i18next"
import React from "react"
import { IPart3StepCodeChecklist } from "../../../../../../../models/part-3-step-code-checklist"
import { theme } from "../../../../../../../styles/theme"
import { IStepCodeOccupancy } from "../../../../../../../types/types"
import { Input } from "../../../../part-9/checklist/pdf-content/shared/field"
import { zeroCarbonI18nPrefix } from "./i18n-prefix"
import { styles } from "./styles"

interface IProps {
  checklist: IPart3StepCodeChecklist
}

export const StepCodeZeroCarbonPdf = ({ checklist }: IProps) => {
  const occupancy: IStepCodeOccupancy = checklist.stepCodeOccupancies[0]
  const stepAchieved = checklist.complianceReport.performance.complianceSummary.zeroCarbonStepAchieved

  const requiredStepValue = t(
    `stepCodeChecklist.edit.codeComplianceSummary.zeroCarbonStepCode.steps.${occupancy.zeroCarbonStepRequired}`
  )
  const achievedStepValue = stepAchieved
    ? t(`stepCodeChecklist.edit.codeComplianceSummary.zeroCarbonStepCode.steps.${stepAchieved}`)
    : "-"

  return (
    <>
      <View style={styles.fieldInputContainer}>
        <Text style={styles.fieldLabel}>{t(`${zeroCarbonI18nPrefix}.levelRequired`)}</Text>
        <Input value={requiredStepValue} inputStyles={styles.fieldInput} />
      </View>
      {/* Placeholder for Steps graphic */}
      <Text style={{ fontSize: 10.5, color: theme.colors.text.secondary }}>(Steps graphic omitted)</Text>
      <View style={styles.fieldInputContainer}>
        <Text style={styles.fieldLabel}>{t(`${zeroCarbonI18nPrefix}.achieved`)}</Text>
        <Input value={achievedStepValue} inputStyles={styles.fieldInput} />
      </View>
    </>
  )
}
