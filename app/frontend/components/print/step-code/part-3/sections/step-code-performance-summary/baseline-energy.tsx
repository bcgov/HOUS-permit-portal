import React from "react"
import { IPart3StepCodeChecklist } from "../../../../../../models/part-3-step-code-checklist"
import { IBaselineOccupancy } from "../../../../../../types/types"
import { reportTranslation as t } from "../../../../components/report-translation"
import { ReportBlock, ReportText, ReportValue } from "../../../../components/step-code-layout"
import { energyI18nPrefix } from "./i18n-prefix"
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
      <ReportBlock className="report-summary-field">
        <ReportText className="report-label">{t(`${energyI18nPrefix}.stepRequired`)}</ReportText>
        <ReportValue
          value={
            occupancy?.performanceRequirement
              ? t(`stepCode.part3.performanceRequirements.${occupancy.performanceRequirement}`)
              : "-"
          }
          className="report-summary-value"
        />
      </ReportBlock>
      <ReportBlock className="report-summary-field">
        <ReportText className="report-label">{t(`${energyI18nPrefix}.achieved`)}</ReportText>
        <ReportValue value={achievedValue} className="report-summary-value report-strong" />
      </ReportBlock>
      <ReportText className="report-result-note">{t(`${energyI18nPrefix}.result.${resultKey}`)}</ReportText>
    </>
  )
}
