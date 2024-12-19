import { t } from "i18next"
import React from "react"
import { IPart3StepCodeChecklist } from "../../../../../../../models/part-3-step-code-checklist"
import { Field } from "../../../../step-generic/pdf-content/shared/field"
import { Panel } from "../../../../step-generic/pdf-content/shared/panel"
import { i18nPrefix } from "../../project-info/i18n-prefix"

interface IProps {
  checklist: IPart3StepCodeChecklist
}
export const DistrictEnergy = ({ checklist }: IProps) => {
  const i18nPrefixDetails = `${i18nPrefix}.districtEnergy`
  return (
    <Panel heading={t(`${i18nPrefixDetails}.heading`)}>
      <Field label={t(`${i18nPrefixDetails}.isRelevant`)} value={!!checklist.districtEnergyFuelType ? "Yes" : "No"} />
      {!!checklist.districtEnergyFuelType && (
        <Field
          label={t(`${i18nPrefixDetails}.emissionsFactor.description`)}
          value={checklist.districtEnergyFuelType.description}
        />
      )}
      {!!checklist.districtEnergyFuelType && (
        <Field
          label={t(`${i18nPrefixDetails}.emissionsFactor.label`)}
          value={checklist.districtEnergyFuelType.emissionsFactor}
        />
      )}
      {!!checklist.districtEnergyFuelType && (
        <Field label={t(`${i18nPrefixDetails}.source.label`)} value={checklist.districtEnergyFuelType.source} />
      )}
    </Panel>
  )
}
