import { Text, View } from "@react-pdf/renderer"
import { t } from "i18next"
import React from "react"
import { IPart3StepCodeChecklist } from "../../../../../../../models/part-3-step-code-checklist"
import { theme } from "../../../../../../../styles/theme"
import { IBaselineOccupancy } from "../../../../../../../types/types"
import { Input } from "../../../../part-9/checklist/pdf-content/shared/field"
import { energyI18nPrefix } from "./i18n-prefix"
import { styles } from "./styles"

interface IProps {
  checklist: IPart3StepCodeChecklist
}

export const BaselineEnergyPdf = ({ checklist }: IProps) => {
  const occupancy: IBaselineOccupancy | undefined = Array.isArray(checklist?.baselineOccupancies)
    ? checklist.baselineOccupancies[0]
    : undefined
  const stepAchieved = checklist?.complianceReport?.performance?.complianceSummary?.performanceRequirementAchieved
  const resultKey = !!stepAchieved ? "success" : "failure"
  const achievedValue = stepAchieved
    ? t(`stepCode.part3.performanceRequirements.${stepAchieved}`)
    : t("stepCode.part3.stepCodeSummary.stepCode.performanceRequirement.notAchieved")

  return (
    <>
      <View style={styles.fieldInputContainer}>
        <Text style={styles.fieldLabel}>{t(`${energyI18nPrefix}.stepRequired`)}</Text>
        <Input
          value={
            occupancy?.performanceRequirement
              ? t(`stepCode.part3.performanceRequirements.${occupancy.performanceRequirement}`)
              : "-"
          }
          inputStyles={styles.fieldInput}
        />
      </View>
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
