import React from "react"
import { IStepCodeZeroCarbonComplianceReport } from "../../../../../../models/step-code-zero-carbon-compliance-report"
import { i18nPrefix } from "../../../../../domains/step-code/part-9/checklist/zero-carbon-step-code-compliance/i18n-prefix"
import { reportTranslation as t } from "../../../../components/report-translation"
import { Panel } from "../../../../components/step-code-primitives"
import { ZeroCarbonComplianceGrid } from "./compliance-grid/index"

interface IProps {
  report: IStepCodeZeroCarbonComplianceReport
}

export const ZeroCarbonStepCompliance = function StepCodeChecklistPDFZeroCarbonStepCompliance({ report }: IProps) {
  return (
    <Panel heading={t(`${i18nPrefix}.heading`)} break>
      <ZeroCarbonComplianceGrid report={report} />
    </Panel>
  )
}
