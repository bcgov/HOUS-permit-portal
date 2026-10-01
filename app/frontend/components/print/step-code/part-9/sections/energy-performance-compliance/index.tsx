import React from "react"
import { IPart9StepCodeChecklist } from "../../../../../../models/part-9-step-code-checklist"
import { i18nPrefix } from "../../../../../domains/step-code/part-9/checklist/energy-performance-compliance/i18n-prefix"
import { reportTranslation as t } from "../../../../components/report-translation"
import {
  ReportBoolean,
  ReportDivider,
  ReportMetric,
  ReportPanel,
  ReportRow,
  ReportText,
} from "../../../../components/step-code-layout"
import { isMissing } from "../../../../form/field-values"
interface IProps {
  checklist: IPart9StepCodeChecklist
}
export const EnergyPerformanceCompliance = function StepCodeChecklistPDFEnergyPerformanceCompliance({
  checklist,
}: IProps) {
  const report = checklist.selectedReport?.energy
  const targetType = checklist.epcCalculationTestingTargetType
  // Older checklists and the existing form show saved ACH even without a target type.
  const testingTarget = isMissing(targetType)
    ? report?.ach
    : targetType && ["ach", "nla", "nlr"].includes(targetType)
      ? report?.[targetType]
      : undefined
  return (
    <ReportPanel heading={t(`${i18nPrefix}.heading`)}>
      <ReportText className="report-strong">{t(`${i18nPrefix}.proposedHouseEnergyConsumption`)}</ReportText>

      <ReportRow className="report-equation">
        <ReportMetric
          value={checklist.hvacConsumption}
          hint={t(`${i18nPrefix}.energyUnit`)}
          label={t(`${i18nPrefix}.hvac`)}
        />
        <ReportText className="report-strong">+</ReportText>
        <ReportMetric
          label={t(`${i18nPrefix}.dwhHeating`)}
          value={checklist.dhwHeatingConsumption}
          hint={t(`${i18nPrefix}.energyUnit`)}
        />
        <ReportText className="report-strong">=</ReportText>
        <ReportMetric
          label={t(`${i18nPrefix}.sum`)}
          value={
            [checklist.dhwHeatingConsumption, checklist.hvacConsumption].every(
              (v) => v != null && v !== "" && Number.isFinite(Number(v))
            )
              ? Number(checklist.dhwHeatingConsumption) + Number(checklist.hvacConsumption)
              : undefined
          }
          hint={t(`${i18nPrefix}.energyUnit`)}
        />
      </ReportRow>

      <ReportDivider />

      <ReportRow>
        <ReportMetric
          label={t(`${i18nPrefix}.calculationAirtightness`)}
          value={t(`${i18nPrefix}.airtightnessValue.options.${checklist.epcCalculationAirtightness}`)}
        />
      </ReportRow>
      <ReportMetric
        className="report-testing-target"
        label={t(`${i18nPrefix}.calculationTestingTarget`)}
        value={testingTarget}
        rightElement={t(`${i18nPrefix}.epcTestingTargetType.options.${targetType}`)}
      />
      <ReportText>
        <ReportBoolean isChecked={checklist.epcCalculationCompliance} />
        {" — "}
        {t(`${i18nPrefix}.compliance`)}
      </ReportText>
    </ReportPanel>
  )
}
