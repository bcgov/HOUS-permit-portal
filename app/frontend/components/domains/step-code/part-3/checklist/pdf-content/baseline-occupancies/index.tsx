import { t } from "i18next"
import * as R from "ramda"
import React from "react"
import { IPart3StepCodeChecklist } from "../../../../../../../models/part-3-step-code-checklist"
import { Field } from "../../../../step-generic/pdf-content/shared/field"
import { Panel } from "../../../../step-generic/pdf-content/shared/panel"
import { i18nPrefix } from "../../project-info/i18n-prefix"

interface IProps {
  checklist: IPart3StepCodeChecklist
}
export const BaselineOccupancy = ({ checklist }: IProps) => {
  const i18nPrefixDetails = `${i18nPrefix}.baselineOccupancies`
  return (
    <Panel heading={t(`${i18nPrefixDetails}.heading`)}>
      <Field
        label={t(`${i18nPrefixDetails}.isRelevant`)}
        value={!R.isEmpty(checklist?.baselineOccupancies) ? "Yes" : "No"}
      />
    </Panel>
  )
}
