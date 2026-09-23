import React from "react"
import { IPart9StepCodeChecklist } from "../../../../../../../models/part-9-step-code-checklist"
import { generateUUID } from "../../../../../../../utils/utility-functions"
import { i18nPrefix } from "../../../../../../domains/step-code/part-9/checklist/building-characteristics-summary/i18n-prefix"
import { reportTranslation as t } from "../../../../../components/report-translation"
import { ReportCell, ReportMetric, ReportRow, ReportText } from "../../../../../components/step-code-layout"
interface IProps {
  checklist: IPart9StepCodeChecklist
}
export function Other({ checklist }: IProps) {
  return (
    <>
      <ReportRow>
        <ReportCell colSpan={4}>
          <ReportText>{t(`${i18nPrefix}.other`)}</ReportText>
        </ReportCell>
      </ReportRow>
      {checklist.buildingCharacteristicsSummary.otherLines.map((line, index) => (
        <ReportRow key={generateUUID()}>
          <ReportCell colSpan={4}>
            <ReportMetric value={line.details} />
          </ReportCell>
        </ReportRow>
      ))}
    </>
  )
}
