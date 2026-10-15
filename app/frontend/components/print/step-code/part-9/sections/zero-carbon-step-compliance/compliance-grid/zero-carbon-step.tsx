import React from "react"
import { IStepCodeZeroCarbonComplianceReport } from "../../../../../../../models/step-code-zero-carbon-compliance-report"
import { i18nPrefix } from "../../../../../../domains/step-code/part-9/checklist/zero-carbon-step-code-compliance/i18n-prefix"
import { reportTranslation as t } from "../../../../../components/report-translation"
import { ReportCell, ReportMetric, ReportRow, ReportText } from "../../../../../components/step-code-layout"
interface IProps {
  report: IStepCodeZeroCarbonComplianceReport
}
export function ZeroCarbonStep({ report }: IProps) {
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
