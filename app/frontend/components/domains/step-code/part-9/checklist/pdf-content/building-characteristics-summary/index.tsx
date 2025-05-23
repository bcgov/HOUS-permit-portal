import { t } from "i18next"
import React from "react"
import { IPart9StepCodeChecklist } from "../../../../../../../models/part-9-step-code-checklist"
import { Panel } from "../shared/panel"
import { VStack } from "../shared/v-stack"
import { DynamicCharacteristicsGrid } from "./dynamic-characteristics-grid"
import { StaticCharacteristicsGrid } from "./static-characteristics-grid"

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
