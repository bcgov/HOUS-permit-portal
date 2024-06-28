import { t } from "i18next"
import React from "react"
import { IStepCodeZeroCarbonComplianceReport } from "../../../../../../models/step-code-zero-carbon-compliance-report"
import { TextFormControl } from "../../../../../shared/form/input-form-control"
import { GridData } from "../../shared/grid/data"
import { GridPlaceholder } from "../../shared/grid/placeholder"
import { GridRowHeader } from "../../shared/grid/row-header"
import { i18nPrefix } from "../i18n-prefix"

interface IProps {
  compliance: IStepCodeZeroCarbonComplianceReport
}

export const ZeroCarbonStep = function ZeroCarbonStep({ compliance }: IProps) {
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
