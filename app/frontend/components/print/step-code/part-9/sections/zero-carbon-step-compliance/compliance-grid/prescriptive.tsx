import React from "react"
import { IStepCodeZeroCarbonComplianceReport } from "../../../../../../../models/step-code-zero-carbon-compliance-report"
import { i18nPrefix } from "../../../../../../domains/step-code/part-9/checklist/zero-carbon-step-code-compliance/i18n-prefix"
import { reportTranslation as t } from "../../../../../components/report-translation"
import {
  ReportCell,
  ReportMetric,
  ReportResult,
  ReportRow,
  ReportText,
} from "../../../../../components/step-code-layout"
interface IProps {
  report: IStepCodeZeroCarbonComplianceReport
}
export function Prescriptive({ report }: IProps) {
  return (
    <>
      <ReportRow>
        <ReportCell colSpan={4}>
          <ReportText className="report-strong">{t(`${i18nPrefix}.prescriptive.title`)}</ReportText>
        </ReportCell>
      </ReportRow>
      <>
        <ReportRow>
          <ReportCell>
            <ReportText>{t(`${i18nPrefix}.prescriptive.heating`)}</ReportText>
          </ReportCell>
          <ReportCell>
            <ReportMetric
              value={
                report.prescriptiveHeatingRequirement
                  ? t(`${i18nPrefix}.prescriptive.${report.prescriptiveHeatingRequirement}`)
                  : "-"
              }
            />
          </ReportCell>
          <ReportCell>
            <ReportMetric
              value={report.prescriptiveHeating ? t(`${i18nPrefix}.prescriptive.${report.prescriptiveHeating}`) : "-"}
            />
          </ReportCell>
          <ReportCell colSpan={1} rowSpan={3}>
            <ReportResult success={report.prescriptivePassed} />
          </ReportCell>
        </ReportRow>
        <ReportRow>
          <ReportCell>
            <ReportText>{t(`${i18nPrefix}.prescriptive.hotWater`)}</ReportText>
          </ReportCell>
          <ReportCell>
            <ReportMetric
              value={
                report.prescriptiveHotWaterRequirement
                  ? t(`${i18nPrefix}.prescriptive.${report.prescriptiveHotWaterRequirement}`)
                  : "-"
              }
            />
          </ReportCell>
          <ReportCell>
            <ReportMetric
              value={report.prescriptiveHotWater ? t(`${i18nPrefix}.prescriptive.${report.prescriptiveHotWater}`) : "-"}
            />
          </ReportCell>
        </ReportRow>
        <ReportRow>
          <ReportCell>
            <ReportText>{t(`${i18nPrefix}.prescriptive.other`)}</ReportText>
          </ReportCell>
          <ReportCell>
            <ReportMetric
              value={
                report.prescriptiveOtherRequirement
                  ? t(`${i18nPrefix}.prescriptive.${report.prescriptiveOtherRequirement}`)
                  : "-"
              }
            />
          </ReportCell>
          <ReportCell>
            <ReportMetric
              value={report.prescriptiveOther ? t(`${i18nPrefix}.prescriptive.${report.prescriptiveOther}`) : "-"}
            />
          </ReportCell>
        </ReportRow>
      </>
    </>
  )
}
