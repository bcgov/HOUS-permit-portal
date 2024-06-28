import { t } from "i18next"
import React from "react"
import { IStepCodeEnergyComplianceReport } from "../../../../../../models/step-code-energy-compliance-report"
import { i18nPrefix } from "../../energy-step-code-compliance/i18n-prefix"
import { Field } from "../shared/field"
import { HStack } from "../shared/h-stack"
import { Panel } from "../shared/panel"
import { VStack } from "../shared/v-stack"
import { EnergyComplianceGrid } from "./compliance-grid"
import { OtherData } from "./other-data"

interface IProps {
  report: IStepCodeEnergyComplianceReport
}
export const EnergyStepCompliance = function StepCodeChecklistPDFEnergyStepCompliance({ report }: IProps) {
  return (
    <Panel heading={t(`${i18nPrefix}.heading`)}>
      <HStack style={{ width: "100%", alignItems: "flex-end" }}>
        <Field
          value={report.energyTarget}
          hint={t(`${i18nPrefix}.consumptionUnit`)}
          label={t(`${i18nPrefix}.proposedConsumption`)}
        />
        <Field
          label={t(`${i18nPrefix}.refConsumption`)}
          value={report.refEnergyTarget}
          hint={t(`${i18nPrefix}.consumptionUnit`)}
        />
      </HStack>

      <VStack style={{ spacing: 18 }}>
        <EnergyComplianceGrid report={report} />
        <OtherData report={report} />
      </VStack>
    </Panel>
  )
}
