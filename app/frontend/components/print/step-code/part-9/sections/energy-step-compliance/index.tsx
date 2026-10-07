import React from "react"
import { IStepCodeEnergyComplianceReport } from "../../../../../../models/step-code-energy-compliance-report"
import { i18nPrefix } from "../../../../../domains/step-code/part-9/checklist/energy-step-code-compliance/i18n-prefix"
import { reportTranslation as t } from "../../../../components/report-translation"
import { ReportMetric, ReportPanel, ReportRow, ReportStack } from "../../../../components/step-code-layout"
import { EnergyComplianceGrid } from "./compliance-grid/index"
import { OtherData } from "./other-data"
interface IProps {
  report: IStepCodeEnergyComplianceReport
}
export const EnergyStepCompliance = function StepCodeChecklistPDFEnergyStepCompliance({ report }: IProps) {
  return (
    <ReportPanel heading={t(`${i18nPrefix}.heading`)}>
      <ReportRow>
        <ReportMetric
          value={report.energyTarget}
          hint={t(`${i18nPrefix}.consumptionUnit`)}
          label={t(`${i18nPrefix}.proposedConsumption`)}
        />
        <ReportMetric
          label={t(`${i18nPrefix}.refConsumption`)}
          value={report.refEnergyTarget}
          hint={t(`${i18nPrefix}.consumptionUnit`)}
        />
      </ReportRow>

      <ReportStack>
        <EnergyComplianceGrid report={report} />
        <OtherData report={report} />
      </ReportStack>
    </ReportPanel>
  )
}
