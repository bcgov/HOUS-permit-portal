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
export function TotalGHG({ report }: IProps) {
  return (
    <>
      <ReportRow>
        <ReportCell>
          <ReportText>{t(`${i18nPrefix}.ghg.label`)}</ReportText>
        </ReportCell>
        <ReportCell>
          <ReportMetric
            value={report.totalGhgRequirement ?? "-"}
            hint={t(`${i18nPrefix}.max`)}
            rightElement={
              <ReportStack>
                <ReportText className="report-unit">{t(`${i18nPrefix}.ghg.units.numerator`)}</ReportText>
                <ReportDivider />
                <ReportText className="report-unit">{t(`${i18nPrefix}.ghg.units.denominator`)}</ReportText>
              </ReportStack>
            }
          />
        </ReportCell>
        <ReportCell>
          <ReportMetric
            value={report.totalGhg ?? "-"}
            rightElement={
              <ReportStack>
                <ReportText className="report-unit">{t(`${i18nPrefix}.ghg.units.numerator`)}</ReportText>
                <ReportDivider />
                <ReportText className="report-unit">{t(`${i18nPrefix}.ghg.units.denominator`)}</ReportText>
              </ReportStack>
            }
          />
        </ReportCell>

        <ReportCell>
          <ReportResult success={report.ghgPassed} />
        </ReportCell>
      </ReportRow>
    </>
  )
}
