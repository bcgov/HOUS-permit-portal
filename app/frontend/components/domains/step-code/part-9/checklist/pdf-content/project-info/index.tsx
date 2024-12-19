import { Text, View } from "@react-pdf/renderer"
import { t } from "i18next"
import React from "react"
import { IPart9StepCodeChecklist } from "../../../../../../../models/part-9-step-code-checklist"
import { Field } from "../../../../step-generic/pdf-content/shared/field"
import { Panel } from "../../../../step-generic/pdf-content/shared/panel"
import { i18nPrefix } from "../../project-info/i18n-prefix"

interface IProps {
  checklist: IPart9StepCodeChecklist
}
export const ProjectInfo = function StepCodeChecklistPDFProjectInfo({ checklist }: IProps) {
  return (
    <Panel heading={t(`${i18nPrefix}.heading`)}>
      <Text style={{ fontSize: 13.5, fontWeight: 700 }}>{t(`${i18nPrefix}.stages.${checklist.stage}`)}</Text>
      <Field label={t(`${i18nPrefix}.permitNum`)} value={checklist.buildingPermitNumber} />
      <Field label={t(`${i18nPrefix}.builder`)} value={checklist.builder} />
      <Field label={t(`${i18nPrefix}.address`)} value={checklist.address} />
      <Field label={t(`${i18nPrefix}.jurisdiction`)} value={checklist.jurisdictionName} />
      <Field label={t(`${i18nPrefix}.pid`)} value={checklist.pid} />
      <View style={{ display: "flex" }}>
        <Field
          label={t(`${i18nPrefix}.buildingType.label`)}
          value={t(`${i18nPrefix}.buildingType.options.${checklist.buildingType}`)}
        />
        <Field label={t(`${i18nPrefix}.dwellingUnits`)} value={checklist.dwellingUnitsCount} />
      </View>
    </Panel>
  )
}
