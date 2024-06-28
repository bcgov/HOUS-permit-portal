import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React from "react"
import { IStepCodeZeroCarbonComplianceReport } from "../../../../../models/step-code-zero-carbon-compliance-report"
import { ChecklistSection } from "../shared/checklist-section"
import { ZeroCarbonComplianceGrid } from "./compliance-grid"
import { i18nPrefix } from "./i18n-prefix"

interface IProps {
  compliance: IStepCodeZeroCarbonComplianceReport
}

export const ZeroCarbonStepCodeCompliance = observer(function ZeroCarbonStepCodeCompliance({ compliance }: IProps) {
  return (
    <ChecklistSection heading={t(`${i18nPrefix}.heading`)} isAutoFilled>
      <ZeroCarbonComplianceGrid compliance={compliance} />
    </ChecklistSection>
  )
})
