import React from "react"
import { IPart3StepCode } from "../../../../../../models/part-3-step-code"
import { reportTranslation as t } from "../../../../components/report-translation"
import { ReportBlock, ReportMetric, ReportPanel } from "../../../../components/step-code-layout"
interface IProps {
  stepCode: Partial<IPart3StepCode>
}
export const ProjectInfo = function StepCodePart3ChecklistPDFProjectInfo({ stepCode }: IProps) {
  type TPrefix = "stepCode.part3.projectDetails"
  const i18nPrefix: TPrefix = "stepCode.part3.projectDetails"
  return (
    <ReportPanel heading={t(`${i18nPrefix}.heading`)}>
      <ReportMetric label={t(`${i18nPrefix}.name`)} value={stepCode.title} />
      <ReportBlock className="report-columns">
        <ReportMetric label={t(`${i18nPrefix}.address`)} value={stepCode.fullAddress} />
        <ReportMetric label={t(`${i18nPrefix}.jurisdiction`)} value={stepCode.jurisdictionName} />
      </ReportBlock>
      <ReportBlock className="report-columns">
        <ReportMetric label={t(`${i18nPrefix}.identifier`)} value={stepCode.referenceNumber} />
        <ReportMetric
          label={t(`${i18nPrefix}.stage`)}
          value={stepCode.currentStage ? t(`${i18nPrefix}.stages.${stepCode.currentStage}`) : ""}
        />
        <ReportMetric label={t(`${i18nPrefix}.date`)} value={stepCode.permitDate || ""} />
      </ReportBlock>
    </ReportPanel>
  )
}
