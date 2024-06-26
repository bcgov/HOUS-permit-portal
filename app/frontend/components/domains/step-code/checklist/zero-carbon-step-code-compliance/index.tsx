import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React from "react"
import { IStepCodeChecklist } from "../../../../../models/step-code-checklist"
import { ChecklistSection } from "../shared/checklist-section"
import { ZeroCarbonComplianceGrid } from "./compliance-grid"
import { i18nPrefix } from "./i18n-prefix"

interface IProps {
  checklist: IStepCodeChecklist
}

export const ZeroCarbonStepCodeCompliance = observer(function ZeroCarbonStepCodeCompliance({ checklist }: IProps) {
  return (
    <ChecklistSection heading={t(`${i18nPrefix}.heading`)} isAutoFilled>
      <ZeroCarbonComplianceGrid checklist={checklist} />
    </ChecklistSection>
  )
})
