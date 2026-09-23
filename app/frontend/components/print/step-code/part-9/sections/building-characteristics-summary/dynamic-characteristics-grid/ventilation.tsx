import React from "react"
import { IPart9StepCodeChecklist } from "../../../../../../../models/part-9-step-code-checklist"
import { generateUUID } from "../../../../../../../utils/utility-functions"
import { i18nPrefix } from "../../../../../../domains/step-code/part-9/checklist/building-characteristics-summary/i18n-prefix"
import { reportTranslation as t } from "../../../../../components/report-translation"
import { ReportCell, ReportMetric, ReportRow, ReportText } from "../../../../../components/step-code-layout"
interface IProps {
  checklist: IPart9StepCodeChecklist
}
export function Ventilation({ checklist }: IProps) {
  const lines = checklist.buildingCharacteristicsSummary.ventilationLines
  return (
    <>
      <ReportRow>
        <ReportCell colSpan={4}>
          <ReportText>{t(`${i18nPrefix}.ventilation`)}</ReportText>
        </ReportCell>
      </ReportRow>
      {lines.map((line, index) => (
        <ReportRow key={generateUUID()}>
          <ReportCell colSpan={2}>
            <ReportMetric value={line.details} />
          </ReportCell>
          <ReportCell colSpan={1}>
            <ReportMetric value={line.percent_eff} hint={index == lines.length - 1 && t(`${i18nPrefix}.percent_eff`)} />
          </ReportCell>
          <ReportCell colSpan={1}>
            <ReportMetric
              value={line.litersPerSec}
              hint={index == lines.length - 1 && t(`${i18nPrefix}.litersPerSec`)}
            />
          </ReportCell>
        </ReportRow>
      ))}
    </>
  )
}
