import { View } from "@react-pdf/renderer"
import { t } from "i18next"
import React from "react"
import { IPart3StepCode } from "../../../../../../../models/part-3-step-code"
import { IPart3StepCodeChecklist } from "../../../../../../../models/part-3-step-code-checklist"
import { Field } from "../../../../part-9/checklist/pdf-content/shared/field"
import { Panel } from "../../../../part-9/checklist/pdf-content/shared/panel"

interface IProps {
  stepCode: Partial<IPart3StepCode>
  checklist: IPart3StepCodeChecklist
}
export const ProjectInfo = function StepCodePart3ChecklistPDFProjectInfo({ checklist, stepCode }: IProps) {
  type TPrefix = "stepCode.part3.projectDetails"
  const i18nPrefix: TPrefix = "stepCode.part3.projectDetails"
  return (
    <Panel heading={t(`${i18nPrefix}.heading`)}>
      <Field label={t(`${i18nPrefix}.name`)} value={stepCode.title} />
      <View style={{ display: "flex", flexDirection: "row", gap: 6 }}>
        <Field label={t(`${i18nPrefix}.address`)} value={stepCode.fullAddress} style={{ flex: 1 }} />
        <Field label={t(`${i18nPrefix}.jurisdiction`)} value={stepCode.jurisdictionName} style={{ flex: 1 }} />
      </View>
      <View style={{ display: "flex", flexDirection: "row", gap: 6 }}>
        <Field label={t(`${i18nPrefix}.identifier`)} value={stepCode.referenceNumber} style={{ flex: 1 }} />
        <Field
          label={t(`${i18nPrefix}.stage`)}
          value={stepCode.phase ? t(`${i18nPrefix}.stages.${stepCode.phase}`) : ""}
          style={{ flex: 1 }}
        />
        <Field label={t(`${i18nPrefix}.date`)} value={stepCode.permitDate || ""} style={{ flex: 1 }} />
      </View>
      <Field
        label={t(`${i18nPrefix}.version`)}
        value={t(`${i18nPrefix}.buildingCodeVersions.${checklist.buildingCodeVersion}`)}
      />
    </Panel>
  )
}
