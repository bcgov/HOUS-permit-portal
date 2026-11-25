import React from "react"
import { IStepCodeZeroCarbonComplianceReport } from "../../../../../../../models/step-code-zero-carbon-compliance-report"
import { i18nPrefix } from "../../../../../../domains/step-code/part-9/checklist/zero-carbon-step-code-compliance/i18n-prefix"
import { reportTranslation as t } from "../../../../../components/report-translation"
import { ReportCell, ReportGrid, ReportResult, ReportRow, ReportText } from "../../../../../components/step-code-layout"
import { CO2 } from "./co2"
import { Prescriptive } from "./prescriptive"
import { TotalGHG } from "./total-ghg"
import { ZeroCarbonStep } from "./zero-carbon-step"
interface IProps {
  report: IStepCodeZeroCarbonComplianceReport
}
export const ZeroCarbonComplianceGrid = function ZeroCarbonComplianceGrid({ report }: IProps) {
  return (
    <ReportGrid
      headers={[
        t(`${i18nPrefix}.proposedMetrics`),
        t(`${i18nPrefix}.stepRequirement`),
        t(`${i18nPrefix}.result`),
        t(`${i18nPrefix}.passFail`),
      ]}
    >
      <ZeroCarbonStep report={report} />
      <TotalGHG report={report} />
      <CO2 report={report} />
      <Prescriptive report={report} />

      <ReportRow>
        <ReportCell colSpan={3}>
          <ReportText className="report-strong">{t(`${i18nPrefix}.requirementsMet`)}</ReportText>
        </ReportCell>
        <ReportCell colSpan={1}>
          <ReportResult success={report.co2Passed && report.ghgPassed && report.prescriptivePassed} />
        </ReportCell>
      </ReportRow>
    </ReportGrid>
  )
}
