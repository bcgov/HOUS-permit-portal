import { Text } from "@react-pdf/renderer"
import { t } from "i18next"
import * as R from "ramda"
import React from "react"
import { IPart9StepCodeChecklist } from "../../../../../../../models/part-9-step-code-checklist"
import { theme } from "../../../../../../../styles/theme"
import { CheckBox } from "../../../../step-generic/pdf-content/shared/check-box"
import { Divider } from "../../../../step-generic/pdf-content/shared/divider"
import { Field } from "../../../../step-generic/pdf-content/shared/field"
import { HStack } from "../../../../step-generic/pdf-content/shared/h-stack"
import { Panel } from "../../../../step-generic/pdf-content/shared/panel"
import { i18nPrefix } from "../../energy-performance-compliance/i18n-prefix"

interface IProps {
  checklist: IPart9StepCodeChecklist
}
export const EnergyPerformanceCompliance = function StepCodeChecklistPDFEnergyPerformanceCompliance({
  checklist,
}: IProps) {
  const report = checklist.selectedReport.energy
  return (
    <Panel heading={t(`${i18nPrefix}.heading`)} break>
      <Text style={{ fontSize: 12, fontWeight: 700 }}>{t(`${i18nPrefix}.proposedHouseEnergyConsumption`)}</Text>

      <HStack style={{ width: "100%" }}>
        <Field value={checklist.hvacConsumption} hint={t(`${i18nPrefix}.energyUnit`)} label={t(`${i18nPrefix}.hvac`)} />
        <Text style={{ fontWeight: 700, fontSize: 18, marginRight: 6 }}>+</Text>
        <Field
          label={t(`${i18nPrefix}.dwhHeating`)}
          value={checklist.dhwHeatingConsumption}
          hint={t(`${i18nPrefix}.energyUnit`)}
        />
        <Text style={{ fontWeight: 700, fontSize: 18, marginRight: 6 }}>=</Text>
        <Field
          label={t(`${i18nPrefix}.sum`)}
          value={R.sum([parseInt(checklist.dhwHeatingConsumption || "0"), parseInt(checklist.hvacConsumption || "0")])}
          hint={t(`${i18nPrefix}.energyUnit`)}
        />
      </HStack>

      <Divider />

      <Field
        label={t(`${i18nPrefix}.calculationAirtightness`)}
        value={t(`${i18nPrefix}.airtightnessValue.options.${checklist.epcCalculationAirtightness}`)}
      />
      <HStack style={{ width: "100%", alignItems: "flex-end" }}>
        <Field label={t(`${i18nPrefix}.calculationTestingTarget`)} value={report.ach} />
        <Field value={t(`${i18nPrefix}.epcTestingTargetType.options.${checklist.epcCalculationTestingTargetType}`)} />
      </HStack>
      <HStack style={{ width: "100%", gap: 3.5 }}>
        <CheckBox isChecked={checklist.epcCalculationCompliance} />
        <Text style={{ fontSize: 10.5, color: theme.colors.text.primary }}>{t(`${i18nPrefix}.compliance`)}</Text>
      </HStack>
    </Panel>
  )
}
