import React from "react"
import { IPart9StepCodeChecklist } from "../../../../../../models/part-9-step-code-checklist"
import { i18nPrefix } from "../../../../../domains/step-code/part-9/checklist/project-info/i18n-prefix"
import { reportTranslation as t } from "../../../../components/report-translation"
import { ReportMetric, ReportPanel } from "../../../../components/step-code-layout"
interface IProps {
  checklist: IPart9StepCodeChecklist
}
export const BuildingInfo = function StepCodeChecklistPDFBuildingInfo({ checklist }: IProps) {
  return (
    <ReportPanel heading={t("stepCode.part9.buildingInfo.heading")}>
      <ReportMetric label={t(`${i18nPrefix}.builder`)} value={checklist.builder} />
      <ReportMetric
        label={t(`${i18nPrefix}.buildingType.label`)}
        value={checklist.buildingType ? t(`${i18nPrefix}.buildingType.options.${checklist.buildingType}`) : ""}
      />
    </ReportPanel>
  )
}
