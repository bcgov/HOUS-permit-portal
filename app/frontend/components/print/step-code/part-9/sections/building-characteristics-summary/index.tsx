import React from "react"
import { IPart9StepCodeChecklist } from "../../../../../../models/part-9-step-code-checklist"
import { reportTranslation as t } from "../../../../components/report-translation"
import { ReportPanel, ReportStack } from "../../../../components/step-code-layout"
import { DynamicCharacteristicsGrid } from "./dynamic-characteristics-grid/index"
import { StaticCharacteristicsGrid } from "./static-characteristics-grid/index"
interface IProps {
  checklist: IPart9StepCodeChecklist
}
export const BuildingCharacteristicsSummary = function StepCodeChecklistPDFBuildingCharacteristicsSummary({
  checklist,
}: IProps) {
  const i18nPrefix = "stepCodeChecklist.edit.buildingCharacteristicsSummary"
  return (
    <ReportPanel heading={t(`${i18nPrefix}.heading`)}>
      <ReportStack>
        <StaticCharacteristicsGrid checklist={checklist} />
        <DynamicCharacteristicsGrid checklist={checklist} />
      </ReportStack>
    </ReportPanel>
  )
}
