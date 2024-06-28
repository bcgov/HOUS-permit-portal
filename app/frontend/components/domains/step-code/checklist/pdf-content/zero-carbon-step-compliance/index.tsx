import { t } from "i18next"
import React from "react"
import { IStepCodeZeroCarbonComplianceReport } from "../../../../../../models/step-code-zero-carbon-compliance-report"
import { i18nPrefix } from "../../zero-carbon-step-code-compliance/i18n-prefix"
import { Panel } from "../shared/panel"
import { ZeroCarbonComplianceGrid } from "./compliance-grid"

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
