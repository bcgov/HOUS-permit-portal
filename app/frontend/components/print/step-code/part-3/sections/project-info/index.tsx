import React from "react"
import { IPart3StepCode } from "../../../../../../models/part-3-step-code"
import { reportTranslation as t } from "../../../../components/report-translation"
import { Field, Panel, View } from "../../../../components/step-code-primitives"

interface IProps {
  stepCode: Partial<IPart3StepCode>
}
export const ProjectInfo = function StepCodePart3ChecklistPDFProjectInfo({ stepCode }: IProps) {
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
          value={stepCode.currentStage ? t(`${i18nPrefix}.stages.${stepCode.currentStage}`) : ""}
          style={{ flex: 1 }}
        />
        <Field label={t(`${i18nPrefix}.date`)} value={stepCode.permitDate || ""} style={{ flex: 1 }} />
      </View>
    </Panel>
  )
}
