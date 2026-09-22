import React from "react"
import { IPart9StepCodeChecklist } from "../../../../../../models/part-9-step-code-checklist"
import { i18nPrefix } from "../../../../../domains/step-code/part-9/checklist/project-info/i18n-prefix"
import { reportTranslation as t } from "../../../../components/report-translation"
import { Field, Panel } from "../../../../components/step-code-primitives"

interface IProps {
  checklist: IPart9StepCodeChecklist
}

export const BuildingInfo = function StepCodeChecklistPDFBuildingInfo({ checklist }: IProps) {
  return (
    <Panel heading={t("stepCode.part9.buildingInfo.heading")} break>
      <Field label={t(`${i18nPrefix}.builder`)} value={checklist.builder} />
      <Field
        label={t(`${i18nPrefix}.buildingType.label`)}
        value={checklist.buildingType ? t(`${i18nPrefix}.buildingType.options.${checklist.buildingType}`) : ""}
      />
    </Panel>
  )
}
