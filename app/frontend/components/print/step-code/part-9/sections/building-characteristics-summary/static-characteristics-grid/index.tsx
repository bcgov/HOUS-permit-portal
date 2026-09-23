import React from "react"
import { IPart9StepCodeChecklist } from "../../../../../../../models/part-9-step-code-checklist"
import { i18nPrefix } from "../../../../../../domains/step-code/part-9/checklist/building-characteristics-summary/i18n-prefix"
import { ReportTable } from "../../../../../components/report-table"
import { reportTranslation as t } from "../../../../../components/report-translation"
import { displayValue } from "../../../../../form/field-values"
export function StaticCharacteristicsGrid({ checklist }: { checklist: IPart9StepCodeChecklist }) {
  const groups = ["roofCeilings", "aboveGradeWalls", "framings", "unheatedFloors", "belowGradeWalls", "slabs"]
  return (
    <ReportTable
      layout="details"
      headers={["Building element", t(`${i18nPrefix}.details`), t(`${i18nPrefix}.averageRSI`)]}
      rows={groups.flatMap((key) => {
        const lines = checklist.buildingCharacteristicsSummary?.[`${key}Lines`]
        return (lines?.length ? lines : [{}]).map((line) => [
          t(`${i18nPrefix}.${key}`),
          displayValue(line.details),
          displayValue(line.rsi),
        ])
      })}
    />
  )
}
