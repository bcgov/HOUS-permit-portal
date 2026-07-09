import { t } from "i18next"
import React from "react"
import { IPart9StepCodeChecklist } from "../../../../../../../models/part-9-step-code-checklist"
import { i18nPrefix } from "../../project-info/i18n-prefix"
import { Field } from "../shared/field"
import { Panel } from "../shared/panel"

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
