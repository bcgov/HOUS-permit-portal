import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React, { forwardRef } from "react"
import { IStepCodeZeroCarbonComplianceReport } from "../../../../../models/step-code-zero-carbon-compliance-report"
import { ChecklistSection } from "../shared/checklist-section"
import { ZeroCarbonComplianceGrid } from "./compliance-grid"
import { i18nPrefix } from "./i18n-prefix"

interface IProps {
  compliance: IStepCodeZeroCarbonComplianceReport
}

export const ZeroCarbonStepCodeCompliance = observer(
  forwardRef<HTMLDivElement, IProps>(function ZeroCarbonStepCodeCompliance({ compliance }, ref) {
    return (
      <ChecklistSection ref={ref} heading={t(`${i18nPrefix}.heading`)} isAutoFilled>
        <ZeroCarbonComplianceGrid compliance={compliance} />
      </ChecklistSection>
    )
  })
)
