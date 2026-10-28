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
export function Airtightness({ report }: IProps) {
  return (
    <>
      <>
        <ReportRow>
          <ReportCell>
            <ReportText>{t(`${i18nPrefix}.ach`)}</ReportText>
          </ReportCell>
          <ReportCell>
            <ReportMetric
              value={report.achRequirement ?? "-"}
              hint={t(`${i18nPrefix}.max`)}
              rightElement={
                <ReportStack>
                  <ReportText className="report-unit">{t(`${i18nPrefix}.achUnits.numerator`)}</ReportText>
                  <ReportDivider />
                  <ReportText className="report-unit">{t(`${i18nPrefix}.achUnits.denominator`)}</ReportText>
                </ReportStack>
              }
            />
          </ReportCell>
          <ReportCell>
            <ReportMetric
              value={report.ach ?? "-"}
              rightElement={
                <ReportStack>
                  <ReportText className="report-unit">{t(`${i18nPrefix}.achUnits.numerator`)}</ReportText>
                  <ReportDivider />
                  <ReportText className="report-unit">{t(`${i18nPrefix}.achUnits.denominator`)}</ReportText>
                </ReportStack>
              }
            />
          </ReportCell>
          <ReportCell colSpan={1} rowSpan={3}>
            <ReportResult success={report.airtightnessPassed} />
          </ReportCell>
        </ReportRow>
        <ReportRow>
          <ReportCell>
            {/* TODO: fix subscript (font import) */}
            <ReportText>{t(`${i18nPrefix}.nla`)}</ReportText>
          </ReportCell>
          <ReportCell>
            <ReportMetric
              value={report.nlaRequirement ?? "-"}
              hint={t(`${i18nPrefix}.max`)}
              rightElement={
                <ReportStack>
                  <ReportText className="report-unit">{t(`${i18nPrefix}.nlaUnits.numerator`)}</ReportText>
                  <ReportDivider />
                  <ReportText className="report-unit">{t(`${i18nPrefix}.nlaUnits.denominator`)}</ReportText>
                </ReportStack>
              }
            />
          </ReportCell>
          <ReportCell>
            <ReportMetric
              value={report.nla ?? "-"}
              rightElement={
                <ReportStack>
                  <ReportText className="report-unit">{t(`${i18nPrefix}.nlaUnits.numerator`)}</ReportText>
                  <ReportDivider />
                  <ReportText className="report-unit">{t(`${i18nPrefix}.nlaUnits.denominator`)}</ReportText>
                </ReportStack>
              }
            />
          </ReportCell>
        </ReportRow>
        <ReportRow>
          <ReportCell>
            {/* TODO: fix subscript (font import) */}
            <ReportText>{t(`${i18nPrefix}.nlr`)}</ReportText>
          </ReportCell>
          <ReportCell>
            <ReportMetric
              value={report.nlrRequirement ?? "-"}
              rightElement={<ReportText className="report-unit">{t(`${i18nPrefix}.nlrUnits`)}</ReportText>}
            />
          </ReportCell>
          <ReportCell>
            <ReportMetric
              value={report.nlr ?? "-"}
              rightElement={<ReportText className="report-unit">{t(`${i18nPrefix}.nlrUnits`)}</ReportText>}
            />
          </ReportCell>
        </ReportRow>
      </>
    </>
  )
}
