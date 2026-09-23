import React from "react"
import { IStepCodeEnergyComplianceReport } from "../../../../../../../models/step-code-energy-compliance-report"
import { i18nPrefix } from "../../../../../../domains/step-code/part-9/checklist/energy-step-code-compliance/i18n-prefix"
import { reportTranslation as t } from "../../../../../components/report-translation"
import {
  ReportCell,
  ReportDivider,
  ReportMetric,
  ReportResult,
  ReportRow,
  ReportStack,
  ReportText,
} from "../../../../../components/step-code-layout"
interface IProps {
  report: IStepCodeEnergyComplianceReport
}
export function MEUI({ report }: IProps) {
  return (
    <>
      <>
        <ReportRow>
          <ReportCell>
            <ReportText>{t(`${i18nPrefix}.meui`)}</ReportText>
          </ReportCell>
          <ReportCell>
            <ReportMetric
              value={report.meuiRequirement}
              hint={t(`${i18nPrefix}.max`)}
              rightElement={
                <ReportStack>
                  <ReportText className="report-unit">{t(`${i18nPrefix}.meuiUnits.numerator`)}</ReportText>
                  <ReportDivider />
                  <ReportText className="report-unit">{t(`${i18nPrefix}.meuiUnits.denominator`)}</ReportText>
                </ReportStack>
              }
            />
          </ReportCell>
          <ReportCell>
            <ReportMetric
              value={report.meui}
              rightElement={
                <ReportStack>
                  <ReportText className="report-unit">{t(`${i18nPrefix}.meuiUnits.numerator`)}</ReportText>
                  <ReportDivider />
                  <ReportText className="report-unit">{t(`${i18nPrefix}.meuiUnits.denominator`)}</ReportText>
                </ReportStack>
              }
            />
          </ReportCell>
          <ReportCell colSpan={1} rowSpan={2}>
            <ReportResult success={report.meuiPassed} />
          </ReportCell>
        </ReportRow>
        <ReportRow>
          <ReportCell>
            <ReportText>{t(`${i18nPrefix}.meuiImprovement`)}</ReportText>
          </ReportCell>
          <ReportCell>
            <ReportMetric
              value={report.meuiPercentImprovementRequirement}
              hint={t(`${i18nPrefix}.min`)}
              rightElement={<ReportText className="report-unit">%</ReportText>}
            />
          </ReportCell>
          <ReportCell>
            <ReportMetric
              value={report.meuiPercentImprovement}
              rightElement={<ReportText className="report-unit">%</ReportText>}
            />
          </ReportCell>
        </ReportRow>
      </>
    </>
  )
}
