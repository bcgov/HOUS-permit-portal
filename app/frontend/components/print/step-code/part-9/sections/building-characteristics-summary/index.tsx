import React from "react"
import { IPart9StepCodeChecklist } from "../../../../../../models/part-9-step-code-checklist"
import { reportTranslation as t } from "../../../../components/report-translation"
import { Panel, VStack } from "../../../../components/step-code-primitives"
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
    <Panel heading={t(`${i18nPrefix}.heading`)} break>
      <VStack style={{ spacing: 18 }}>
        <StaticCharacteristicsGrid checklist={checklist} />
        <DynamicCharacteristicsGrid checklist={checklist} />
      </VStack>
    </Panel>
  )
}
