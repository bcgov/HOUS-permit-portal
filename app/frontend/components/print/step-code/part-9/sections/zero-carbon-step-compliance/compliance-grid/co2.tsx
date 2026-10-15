import React from "react"
import { IStepCodeZeroCarbonComplianceReport } from "../../../../../../../models/step-code-zero-carbon-compliance-report"
import { i18nPrefix } from "../../../../../../domains/step-code/part-9/checklist/zero-carbon-step-code-compliance/i18n-prefix"
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
  report: IStepCodeZeroCarbonComplianceReport
}
export function CO2({ report }: IProps) {
  return (
    <>
      <ReportRow>
        <ReportCell colSpan={4}>
          <ReportText className="report-strong">{t(`${i18nPrefix}.co2.title`)}</ReportText>
        </ReportCell>
      </ReportRow>
      <>
        <ReportRow>
          <ReportCell>
            <ReportText>{t(`${i18nPrefix}.co2.perFloorArea.label`)}</ReportText>
          </ReportCell>
          <ReportCell>
            <ReportMetric
              value={report.co2Requirement}
              hint={t(`${i18nPrefix}.max`)}
              rightElement={
                <ReportStack>
                  <ReportText className="report-unit">{t(`${i18nPrefix}.co2.perFloorArea.units.numerator`)}</ReportText>
                  <ReportDivider />
                  <ReportText className="report-unit">
                    {t(`${i18nPrefix}.co2.perFloorArea.units.denominator`)}
                  </ReportText>
                </ReportStack>
              }
            />
          </ReportCell>
          <ReportCell>
            <ReportMetric
              value={report.co2 ?? "-"}
              rightElement={
                <ReportStack>
                  <ReportText className="report-unit">{t(`${i18nPrefix}.co2.perFloorArea.units.numerator`)}</ReportText>
                  <ReportDivider />
                  <ReportText className="report-unit">
                    {t(`${i18nPrefix}.co2.perFloorArea.units.denominator`)}
                  </ReportText>
                </ReportStack>
              }
            />
          </ReportCell>
          <ReportCell colSpan={1} rowSpan={2}>
            <ReportResult success={report.co2Passed} />
          </ReportCell>
        </ReportRow>
        <ReportRow>
          <ReportCell>
            <ReportText>{t(`${i18nPrefix}.co2.max.label`)}</ReportText>
          </ReportCell>
          <ReportCell>
            <ReportMetric
              value={report.co2MaxRequirement ?? "-"}
              hint={t(`${i18nPrefix}.max`)}
              rightElement={<ReportText className="report-unit">{t(`${i18nPrefix}.co2.max.units`)}</ReportText>}
            />
          </ReportCell>
          <ReportCell>
            <ReportMetric
              value={report.totalGhg ?? "-"}
              rightElement={<ReportText className="report-unit">{t(`${i18nPrefix}.co2.max.units`)}</ReportText>}
            />
          </ReportCell>
        </ReportRow>
      </>
    </>
  )
}
