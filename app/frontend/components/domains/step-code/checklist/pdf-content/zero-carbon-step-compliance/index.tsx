import { t } from "i18next"
import React from "react"
import { IStepCodeChecklist } from "../../../../../../models/step-code-checklist"
import { i18nPrefix } from "../../zero-carbon-step-code-compliance/i18n-prefix"
import { Panel } from "../shared/panel"
import { ZeroCarbonComplianceGrid } from "./compliance-grid"

interface IProps {
  checklist: IStepCodeChecklist
}

export const ZeroCarbonStepCompliance = function StepCodeChecklistPDFZeroCarbonStepCompliance({ checklist }: IProps) {
  return (
    <Panel heading={t(`${i18nPrefix}.heading`)} break>
      <ZeroCarbonComplianceGrid checklist={checklist} />
    </Panel>
  )
}
