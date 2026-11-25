import React from "react"
import { reportTranslation as t } from "../../../../components/report-translation"
import { ReportBlock, ReportText, ReportValue } from "../../../../components/step-code-layout"
import { zeroCarbonI18nPrefix } from "./i18n-prefix"
interface IProps {}
export const MixedUseZeroCarbonPdf = (_props: IProps) => (
  <>
    <ReportText>{t(`${zeroCarbonI18nPrefix}.multiOccupancy`)}</ReportText>
    <ReportBlock className="report-summary-field">
      <ReportText className="report-label">{t(`${zeroCarbonI18nPrefix}.levelRequired`)}</ReportText>
      <ReportValue value="-" className="report-summary-value" />
    </ReportBlock>
    {/* Step result is expressed in text for printing. */}

    <ReportBlock className="report-summary-field">
      <ReportText className="report-label">{t(`${zeroCarbonI18nPrefix}.achieved`)}</ReportText>
      <ReportValue value="-" className="report-summary-value" />
    </ReportBlock>
  </>
)
