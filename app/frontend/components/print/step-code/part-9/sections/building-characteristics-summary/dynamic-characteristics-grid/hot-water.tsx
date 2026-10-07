import React from "react"
import { IPart9StepCodeChecklist } from "../../../../../../../models/part-9-step-code-checklist"
import { EHotWaterPerformanceType } from "../../../../../../../types/enums"
import { generateUUID } from "../../../../../../../utils/utility-functions"
import { i18nPrefix } from "../../../../../../domains/step-code/part-9/checklist/building-characteristics-summary/i18n-prefix"
import { reportTranslation as t } from "../../../../../components/report-translation"
import { ReportCell, ReportMetric, ReportRow, ReportText } from "../../../../../components/step-code-layout"
interface IProps {
  checklist: IPart9StepCodeChecklist
}
export function HotWater({ checklist }: IProps) {
  return (
    <>
      <ReportRow>
        <ReportCell colSpan={4}>
          <ReportText>{t(`${i18nPrefix}.hotWater`)}</ReportText>
        </ReportCell>
      </ReportRow>
      {checklist.buildingCharacteristicsSummary.hotWaterLines.map((line, index) => (
        <ReportRow key={generateUUID()}>
          <ReportCell colSpan={2}>
            <ReportMetric value={line.details} />
          </ReportCell>
          <ReportCell colSpan={1}>
            <ReportMetric value={t(`${i18nPrefix}.${line.performanceType as EHotWaterPerformanceType}`)} />
          </ReportCell>
          <ReportCell colSpan={1}>
            <ReportMetric value={line.performanceValue} />
          </ReportCell>
        </ReportRow>
      ))}
    </>
  )
}
