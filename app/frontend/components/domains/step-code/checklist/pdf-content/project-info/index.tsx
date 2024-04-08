import { Text, View } from "@react-pdf/renderer"
import { t } from "i18next"
import React from "react"
import { IStepCodeChecklist } from "../../../../../../models/step-code-checklist"
import { i18nPrefix } from "../../project-info/i18n-prefix"
import { Field } from "../shared/field"
import { Panel } from "../shared/panel"

interface IProps {
  checklist: IStepCodeChecklist
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
