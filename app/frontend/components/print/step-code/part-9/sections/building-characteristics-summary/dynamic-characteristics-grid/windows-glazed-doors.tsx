import React from "react"
import { IPart9StepCodeChecklist } from "../../../../../../../models/part-9-step-code-checklist"
import { EWindowsGlazedDoorsPerformanceType } from "../../../../../../../types/enums"
import { generateUUID } from "../../../../../../../utils/utility-functions"
import { i18nPrefix } from "../../../../../../domains/step-code/part-9/checklist/building-characteristics-summary/i18n-prefix"
import { reportTranslation as t } from "../../../../../components/report-translation"
import { ReportCell, ReportMetric, ReportRow, ReportText } from "../../../../../components/step-code-layout"
interface IProps {
  checklist: IPart9StepCodeChecklist
}
export function WindowsGlazedDoors({ checklist }: IProps) {
  return (
    <>
      <ReportRow>
        <ReportCell colSpan={2}>
          <ReportText>{t(`${i18nPrefix}.windowsGlazedDoors`)}</ReportText>
        </ReportCell>
        <ReportCell colSpan={1}>
          <ReportText>
            {t(
              `${i18nPrefix}.${checklist.buildingCharacteristicsSummary.windowsGlazedDoors.performanceType as EWindowsGlazedDoorsPerformanceType}`
            )}
          </ReportText>
        </ReportCell>
        <ReportCell colSpan={1}>
          <ReportText>{t(`${i18nPrefix}.shgc`)}</ReportText>
        </ReportCell>
      </ReportRow>
      {checklist.buildingCharacteristicsSummary.windowsGlazedDoors.lines.map((line, index) => (
        <ReportRow key={generateUUID()}>
          <ReportCell colSpan={2}>
            <ReportMetric value={line.details} />
          </ReportCell>
          <ReportCell colSpan={1}>
            <ReportMetric value={line.performanceValue} />
          </ReportCell>
          <ReportCell colSpan={1}>
            <ReportMetric value={line.shgc} />
          </ReportCell>
        </ReportRow>
      ))}
    </>
  )
}
