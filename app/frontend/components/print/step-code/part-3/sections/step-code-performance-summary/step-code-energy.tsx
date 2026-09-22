import React from "react"
import { IPart3StepCodeChecklist } from "../../../../../../models/part-3-step-code-checklist"
import { theme } from "../../../../../../styles/theme"
import { IStepCodeOccupancy } from "../../../../../../types/types"
import { reportTranslation as t } from "../../../../components/report-translation"
import { Input, Text, View } from "../../../../components/step-code-primitives"
import { energyI18nPrefix } from "./i18n-prefix"
import { styles } from "./styles"

interface IProps {
  checklist: IPart3StepCodeChecklist
}

export const StepCodeEnergyPdf = ({ checklist }: IProps) => {
  const occupancy: IStepCodeOccupancy = checklist.stepCodeOccupancies[0]
  const stepAchieved = checklist.complianceReport.performance.complianceSummary.energyStepAchieved
  const resultKey = !!stepAchieved ? "success" : "failure"
  const achievedValue = stepAchieved
    ? t(`stepCodeChecklist.edit.codeComplianceSummary.energyStepCode.steps.${stepAchieved}`) // Use full key for t()
    : t(`${energyI18nPrefix}.notAchieved`)

  return (
    <>
      <View style={styles.fieldInputContainer}>
        <Text style={styles.fieldLabel}>{t(`${energyI18nPrefix}.stepRequired`)}</Text>
        <Input
          value={t(`stepCodeChecklist.edit.codeComplianceSummary.energyStepCode.steps.${occupancy.energyStepRequired}`)} // Use full key for t()
          inputStyles={styles.fieldInput}
        />
      </View>
      {/* Step result is expressed in text for printing. */}

      <View style={styles.fieldInputContainer}>
        <Text style={styles.fieldLabel}>{t(`${energyI18nPrefix}.achieved`)}</Text>
        <Input
          value={achievedValue}
          inputStyles={{
            ...styles.fieldInput,
            fontWeight: "bold",
            backgroundColor:
              resultKey === "success"
                ? theme.colors.semantic.infoLight // Or successLight if defined
                : theme.colors.semantic.errorLight,
            borderColor:
              resultKey === "success"
                ? theme.colors.semantic.info // Or success if defined
                : theme.colors.semantic.error,
            borderWidth: 0.75,
          }}
        />
      </View>
      <Text style={styles.resultText}>{t(`${energyI18nPrefix}.result.${resultKey}`)}</Text>
    </>
  )
}
