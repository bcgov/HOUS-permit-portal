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
interface IProps {
  checklist: IPart9StepCodeChecklist
}
export const EnergyPerformanceCompliance = function StepCodeChecklistPDFEnergyPerformanceCompliance({
  checklist,
}: IProps) {
  const report = checklist.selectedReport?.energy
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
      <ReportRow>
        <ReportMetric label={t(`${i18nPrefix}.calculationTestingTarget`)} value={report?.ach} />
        <ReportMetric
          value={t(`${i18nPrefix}.epcTestingTargetType.options.${checklist.epcCalculationTestingTargetType}`)}
        />
      </ReportRow>
      <ReportRow>
        <ReportBoolean isChecked={checklist.epcCalculationCompliance} />
        <ReportText>{t(`${i18nPrefix}.compliance`)}</ReportText>
      </ReportRow>
    </ReportPanel>
  )
}
