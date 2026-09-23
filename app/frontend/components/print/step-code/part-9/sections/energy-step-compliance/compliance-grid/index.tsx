import React from "react"
import { IStepCodeEnergyComplianceReport } from "../../../../../../../models/step-code-energy-compliance-report"
import { i18nPrefix } from "../../../../../../domains/step-code/part-9/checklist/energy-step-code-compliance/i18n-prefix"
import { reportTranslation as t } from "../../../../../components/report-translation"
import { ReportCell, ReportGrid, ReportResult, ReportRow, ReportText } from "../../../../../components/step-code-layout"
import { Airtightness } from "./airtightness"
import { EnergyStep } from "./energy-step"
import { MEUI } from "./meui"
import { TEDI } from "./tedi"
interface IProps {
  report: IStepCodeEnergyComplianceReport
}
export const EnergyComplianceGrid = function EnergyComplianceGrid({ report }: IProps) {
  return (
    <ReportGrid
      headers={[
        t(`${i18nPrefix}.proposedMetrics`),
        t(`${i18nPrefix}.requirement`),
        t(`${i18nPrefix}.results`),
        t(`${i18nPrefix}.passFail`),
      ]}
    >
      <EnergyStep report={report} />
      <MEUI report={report} />
      <TEDI report={report} />
      <Airtightness report={report} />

      <ReportRow>
        <ReportCell colSpan={3}>
          <ReportText className="report-strong">{t(`${i18nPrefix}.requirementsMet`)}</ReportText>
        </ReportCell>
        <ReportCell colSpan={1}>
          <ReportResult success={report.meuiPassed && report.tediPassed && report.airtightnessPassed} />
        </ReportCell>
      </ReportRow>
    </ReportGrid>
  )
}
