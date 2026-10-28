import React from "react"
import { IPart3StepCodeChecklist } from "../../../../../../models/part-3-step-code-checklist"
import { IStepCodeOccupancy } from "../../../../../../types/types"
import { reportTranslation as t } from "../../../../components/report-translation"
import { ReportBlock, ReportText, ReportValue } from "../../../../components/step-code-layout"
import { energyI18nPrefix } from "./i18n-prefix"
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
      <ReportBlock className="report-summary-field">
        <ReportText className="report-label">{t(`${energyI18nPrefix}.stepRequired`)}</ReportText>
        <ReportValue
          value={t(`stepCodeChecklist.edit.codeComplianceSummary.energyStepCode.steps.${occupancy.energyStepRequired}`)} // Use full key for t()
          className="report-summary-value"
        />
      </ReportBlock>
      {/* Step result is expressed in text for printing. */}

      <ReportBlock className="report-summary-field">
        <ReportText className="report-label">{t(`${energyI18nPrefix}.achieved`)}</ReportText>
        <ReportValue value={achievedValue} className="report-summary-value report-strong" />
      </ReportBlock>
      <ReportText className="report-result-note">{t(`${energyI18nPrefix}.result.${resultKey}`)}</ReportText>
    </>
  )
}
