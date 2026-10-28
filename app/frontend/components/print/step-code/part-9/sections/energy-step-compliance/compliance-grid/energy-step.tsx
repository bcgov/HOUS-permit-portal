import React from "react"
import { IStepCodeEnergyComplianceReport } from "../../../../../../../models/step-code-energy-compliance-report"
import { i18nPrefix } from "../../../../../../domains/step-code/part-9/checklist/energy-step-code-compliance/i18n-prefix"
import { reportTranslation as t } from "../../../../../components/report-translation"
import { ReportCell, ReportMetric, ReportRow, ReportText } from "../../../../../components/step-code-layout"
interface IProps {
  report: IStepCodeEnergyComplianceReport
}
export function EnergyStep({ report }: IProps) {
  return (
    <ReportRow>
      <ReportCell colSpan={1}>
        <ReportText>{t(`${i18nPrefix}.step`)}</ReportText>
      </ReportCell>
      <ReportCell colSpan={1}>
        <ReportMetric value={report.requiredStep} />
      </ReportCell>
      <ReportCell colSpan={2} />
    </ReportRow>
  )
}
