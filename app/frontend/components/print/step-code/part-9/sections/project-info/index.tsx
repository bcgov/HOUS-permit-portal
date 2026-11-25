import React from "react"
import { IPart9StepCodeChecklist } from "../../../../../../models/part-9-step-code-checklist"
import { i18nPrefix } from "../../../../../domains/step-code/part-9/checklist/project-info/i18n-prefix"
import { reportTranslation as t } from "../../../../components/report-translation"
import { ReportMetric, ReportPanel, ReportText } from "../../../../components/step-code-layout"
interface IProps {
  checklist: IPart9StepCodeChecklist
}
export const ProjectInfo = function StepCodeChecklistPDFProjectInfo({ checklist }: IProps) {
  return (
    <ReportPanel heading={t(`${i18nPrefix}.heading`)}>
      <ReportText className="report-strong">{t(`${i18nPrefix}.stages.${checklist.stage}`)}</ReportText>
      <ReportMetric label={t(`${i18nPrefix}.permitNum`)} value={checklist.referenceNumber} />
      <ReportMetric label={t(`${i18nPrefix}.address`)} value={checklist.fullAddress} />
      <ReportMetric label={t(`${i18nPrefix}.jurisdiction`)} value={checklist.jurisdictionName} />
      <ReportMetric label={t(`${i18nPrefix}.pid`)} value={checklist.pid} />
    </ReportPanel>
  )
}
