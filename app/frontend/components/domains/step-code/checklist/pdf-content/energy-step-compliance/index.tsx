import { t } from "i18next"
import React from "react"
import { IStepCodeChecklist } from "../../../../../../models/step-code-checklist"
import { i18nPrefix } from "../../energy-step-code-compliance/i18n-prefix"
import { Field } from "../shared/field"
import { HStack } from "../shared/h-stack"
import { Panel } from "../shared/panel"
import { VStack } from "../shared/v-stack"
import { EnergyComplianceGrid } from "./compliance-grid"
import { OtherData } from "./other-data"

interface IProps {
  checklist: IStepCodeChecklist
}
export const EnergyStepCompliance = function StepCodeChecklistPDFEnergyStepCompliance({ checklist }: IProps) {
  return (
    <Panel heading={t(`${i18nPrefix}.heading`)}>
      <HStack style={{ width: "100%", alignItems: "flex-end" }}>
        <Field
          value={checklist.energyTarget}
          hint={t(`${i18nPrefix}.consumptionUnit`)}
          label={t(`${i18nPrefix}.proposedConsumption`)}
        />
        <Field
          label={t(`${i18nPrefix}.refConsumption`)}
          value={checklist.refEnergyTarget}
          hint={t(`${i18nPrefix}.consumptionUnit`)}
        />
      </HStack>

      <VStack style={{ spacing: 18 }}>
        <EnergyComplianceGrid checklist={checklist} />
        <OtherData checklist={checklist} />
      </VStack>
    </Panel>
  )
}
