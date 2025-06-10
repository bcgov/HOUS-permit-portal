import { View } from "@react-pdf/renderer"
import { t } from "i18next"
import React from "react"
import { IPart3StepCodeChecklist } from "../../../../../../../models/part-3-step-code-checklist"
import { Field } from "../../../../part-9/checklist/pdf-content/shared/field"
import { Panel } from "../../../../part-9/checklist/pdf-content/shared/panel"

interface IProps {
  checklist: IPart3StepCodeChecklist
}
export const ProjectInfo = function StepCodePart3ChecklistPDFProjectInfo({ checklist }: IProps) {
  type TPrefix = "stepCode.part3.projectDetails"
  const i18nPrefix: TPrefix = "stepCode.part3.projectDetails"

  return (
    <Panel heading={t(`${i18nPrefix}.heading`)}>
      <Field label={t(`${i18nPrefix}.name`)} value={checklist.projectName} />
      <View style={{ display: "flex", flexDirection: "row", gap: 6 }}>
        <Field label={t(`${i18nPrefix}.address`)} value={checklist.projectAddress} style={{ flex: 1 }} />
        <Field label={t(`${i18nPrefix}.jurisdiction`)} value={checklist.jurisdictionName} style={{ flex: 1 }} />
      </View>
      <View style={{ display: "flex", flexDirection: "row", gap: 6 }}>
        <Field label={t(`${i18nPrefix}.identifier`)} value={checklist.projectIdentifier} style={{ flex: 1 }} />
        <Field
          label={t(`${i18nPrefix}.stage`)}
          value={checklist.projectStage ? t(`${i18nPrefix}.stages.${checklist.projectStage}`) : ""}
          style={{ flex: 1 }}
        />
        <Field label={t(`${i18nPrefix}.date`)} value={checklist.permitDate || ""} style={{ flex: 1 }} />
      </View>
      <Field
        label={t(`${i18nPrefix}.version`)}
        value={t(`${i18nPrefix}.buildingCodeVersions.${checklist.buildingCodeVersion}`)}
      />
    </Panel>
  )
}
