import React from "react"
import { IPart3StepCodeChecklist } from "../../../../../../models/part-3-step-code-checklist"
import { IStepCodeOccupancy } from "../../../../../../types/types"
import { reportTranslation as t } from "../../../../components/report-translation"
import { ReportBlock, ReportText, ReportValue } from "../../../../components/step-code-layout"
import { zeroCarbonI18nPrefix } from "./i18n-prefix"
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
      <ReportBlock className="report-summary-field">
        <ReportText className="report-label">{t(`${zeroCarbonI18nPrefix}.levelRequired`)}</ReportText>
        <ReportValue value={requiredStepValue} className="report-summary-value" />
      </ReportBlock>
      {/* Step result is expressed in text for printing. */}

      <ReportBlock className="report-summary-field">
        <ReportText className="report-label">{t(`${zeroCarbonI18nPrefix}.achieved`)}</ReportText>
        <ReportValue value={achievedStepValue} className="report-summary-value" />
      </ReportBlock>
    </>
  )
}
