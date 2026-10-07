import React from "react"
import { IStepCodeZeroCarbonComplianceReport } from "../../../../../../models/step-code-zero-carbon-compliance-report"
import { i18nPrefix } from "../../../../../domains/step-code/part-9/checklist/zero-carbon-step-code-compliance/i18n-prefix"
import { reportTranslation as t } from "../../../../components/report-translation"
import { ReportPanel } from "../../../../components/step-code-layout"
import { ZeroCarbonComplianceGrid } from "./compliance-grid/index"
interface IProps {
  report: IStepCodeZeroCarbonComplianceReport
}
export const ZeroCarbonStepCompliance = function StepCodeChecklistPDFZeroCarbonStepCompliance({ report }: IProps) {
  return (
    <ReportPanel heading={t(`${i18nPrefix}.heading`)}>
      <ZeroCarbonComplianceGrid report={report} />
    </ReportPanel>
  )
}
