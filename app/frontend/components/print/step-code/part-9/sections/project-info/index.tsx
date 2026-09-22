import React from "react"
import { IPart9StepCodeChecklist } from "../../../../../../models/part-9-step-code-checklist"
import { i18nPrefix } from "../../../../../domains/step-code/part-9/checklist/project-info/i18n-prefix"
import { reportTranslation as t } from "../../../../components/report-translation"
import { Field, Panel, Text } from "../../../../components/step-code-primitives"

interface IProps {
  checklist: IPart9StepCodeChecklist
}
export const ProjectInfo = function StepCodeChecklistPDFProjectInfo({ checklist }: IProps) {
  return (
    <Panel heading={t(`${i18nPrefix}.heading`)}>
      <Text style={{ fontSize: 13.5, fontWeight: 700 }}>{t(`${i18nPrefix}.stages.${checklist.stage}`)}</Text>
      <Field label={t(`${i18nPrefix}.permitNum`)} value={checklist.referenceNumber} />
      <Field label={t(`${i18nPrefix}.address`)} value={checklist.fullAddress} />
      <Field label={t(`${i18nPrefix}.jurisdiction`)} value={checklist.jurisdictionName} />
      <Field label={t(`${i18nPrefix}.pid`)} value={checklist.pid} />
    </Panel>
  )
}
