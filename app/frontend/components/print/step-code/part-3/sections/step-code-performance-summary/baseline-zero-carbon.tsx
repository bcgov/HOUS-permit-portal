import React from "react"
import { reportTranslation as t } from "../../../../components/report-translation"
import { ReportBlock, ReportText } from "../../../../components/step-code-layout"
import { zeroCarbonI18nPrefix } from "./i18n-prefix"
interface IProps {}
export const BaselineZeroCarbonPdf = (_props: IProps) => (
  <>
    <ReportBlock className="report-summary-field">
      <ReportText className="report-label">{t(`${zeroCarbonI18nPrefix}.levelRequired`)}</ReportText>
      <ReportText className="report-strong">{t(`${zeroCarbonI18nPrefix}.notRequired`)}</ReportText>
    </ReportBlock>
    <ReportBlock className="report-summary-field">
      <ReportText className="report-label">{t(`${zeroCarbonI18nPrefix}.achieved`)}</ReportText>
      <ReportText className="report-strong">{t(`${zeroCarbonI18nPrefix}.notRequired`)}</ReportText>
    </ReportBlock>
  </>
)
