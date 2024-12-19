import { t } from "i18next"
import React from "react"
import { IStepCodeEnergyComplianceReport } from "../../../../../../../models/step-code-energy-compliance-report"
import { TextFormControl } from "../../../../../../shared/form/input-form-control"
import { GridData } from "../../../../step-generic/shared/grid/data"
import { GridPlaceholder } from "../../../../step-generic/shared/grid/placeholder"
import { GridRowHeader } from "../../../../step-generic/shared/grid/row-header"
import { i18nPrefix } from "../i18n-prefix"

interface IProps {
  compliance: IStepCodeEnergyComplianceReport
}

export const EnergyStep = function EnergyStep({ compliance }: IProps) {
  return (
    <>
      <GridRowHeader>{t(`${i18nPrefix}.step`)}</GridRowHeader>
      <GridData>
        <TextFormControl inputProps={{ isDisabled: true, textAlign: "center", value: compliance.requiredStep }} />
      </GridData>
      <GridPlaceholder borderLeftWidth={1} colSpan={2} />
    </>
  )
}
