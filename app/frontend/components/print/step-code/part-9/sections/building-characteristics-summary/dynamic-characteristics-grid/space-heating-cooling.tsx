import React from "react"
import { IPart9StepCodeChecklist } from "../../../../../../../models/part-9-step-code-checklist"
import { ESpaceHeatingCoolingPerformanceType } from "../../../../../../../types/enums"
import { generateUUID } from "../../../../../../../utils/utility-functions"
import { i18nPrefix } from "../../../../../../domains/step-code/part-9/checklist/building-characteristics-summary/i18n-prefix"
import { reportTranslation as t } from "../../../../../components/report-translation"
import { ReportCell, ReportMetric, ReportRow, ReportText } from "../../../../../components/step-code-layout"

interface IProps {
  checklist: IPart9StepCodeChecklist
}

// HUB-5472: Flat open lines (no Principal/Secondary headers) to match Rev. 7 BCS UI.
export function SpaceHeatingCooling({ checklist }: IProps) {
  return (
    <>
      <ReportRow>
        <ReportCell colSpan={4}>
          <ReportText>{t(`${i18nPrefix}.spaceHeatingCooling`)}</ReportText>
        </ReportCell>
      </ReportRow>
      {checklist.buildingCharacteristicsSummary.spaceHeatingCoolingLines.map((line) => (
        <ReportRow key={generateUUID()}>
          <ReportCell colSpan={2}>
            <ReportMetric value={line.details} />
          </ReportCell>
          <ReportCell colSpan={1}>
            <ReportMetric
              value={
                line.performanceType
                  ? t(`${i18nPrefix}.${line.performanceType as ESpaceHeatingCoolingPerformanceType}`)
                  : ""
              }
            />
          </ReportCell>
          <ReportCell colSpan={1}>
            <ReportMetric value={line.performanceValue} />
          </ReportCell>
        </ReportRow>
      ))}
    </>
  )
}
