import { t } from "i18next"
import React from "react"
import { IStepCodeChecklist } from "../../../../../../models/step-code-checklist"
import { Panel } from "../shared/panel"
import { VStack } from "../shared/v-stack"
import { DynamicCharacteristicsGrid } from "./dynamic-characteristics-grid"
import { StaticCharacteristicsGrid } from "./static-characteristics-grid"

interface IProps {
  checklist: IStepCodeChecklist
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
