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
export function TEDI({ report }: IProps) {
  return (
    <>
      <>
        <ReportRow>
          <ReportCell>
            <ReportText>{t(`${i18nPrefix}.tedi`)}</ReportText>
          </ReportCell>
          <ReportCell>
            <ReportMetric
              value={report.tediRequirement}
              hint={t(`${i18nPrefix}.max`)}
              rightElement={
                <ReportStack>
                  <ReportText className="report-unit">{t(`${i18nPrefix}.tediUnits.numerator`)}</ReportText>
                  <ReportDivider />
                  <ReportText className="report-unit">{t(`${i18nPrefix}.tediUnits.denominator`)}</ReportText>
                </ReportStack>
              }
            />
          </ReportCell>
          <ReportCell>
            <ReportMetric
              value={report.tedi}
              rightElement={
                <ReportStack>
                  <ReportText className="report-unit">{t(`${i18nPrefix}.tediUnits.numerator`)}</ReportText>
                  <ReportDivider />
                  <ReportText className="report-unit">{t(`${i18nPrefix}.tediUnits.denominator`)}</ReportText>
                </ReportStack>
              }
            />
          </ReportCell>
          <ReportCell colSpan={1} rowSpan={2}>
            <ReportResult success={report.tediPassed} />
          </ReportCell>
        </ReportRow>
        <ReportRow>
          <ReportCell>
            <ReportText>{t(`${i18nPrefix}.hlr`)}</ReportText>
          </ReportCell>
          <ReportCell>
            <ReportMetric
              value={report.tediHlrPercentRequired ?? "-"}
              hint={t(`${i18nPrefix}.min`)}
              rightElement={<ReportText className="report-unit">%</ReportText>}
            />
          </ReportCell>
          <ReportCell>
            <ReportMetric
              value={report.tediHlrPercent}
              rightElement={<ReportText className="report-unit">%</ReportText>}
            />
          </ReportCell>
        </ReportRow>
      </>
    </>
  )
}
