import React from "react"
import { IPart3StepCodeChecklist } from "../../../../../../models/part-3-step-code-checklist"
import { IStepCodeOccupancy } from "../../../../../../types/types"
import { reportTranslation as t } from "../../../../components/report-translation"
import { Input, Text, View } from "../../../../components/step-code-primitives"
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
      {/* Step result is expressed in text for printing. */}

      <View style={styles.fieldInputContainer}>
        <Text style={styles.fieldLabel}>{t(`${zeroCarbonI18nPrefix}.achieved`)}</Text>
        <Input value={achievedStepValue} inputStyles={styles.fieldInput} />
      </View>
    </>
  )
}
