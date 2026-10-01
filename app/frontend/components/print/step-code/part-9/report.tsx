import React from "react"
import { IPart9StepCodeChecklist } from "../../../../models/part-9-step-code-checklist"
import { BuildingCharacteristicsSummary } from "./sections/building-characteristics-summary"
import { BuildingInfo } from "./sections/building-info"
import { CompletedBy } from "./sections/completed-by"
import { ComplianceSummary } from "./sections/compliance-summary"
import { EnergyPerformanceCompliance } from "./sections/energy-performance-compliance"
import { EnergyStepCompliance } from "./sections/energy-step-compliance"
import { ProjectInfo } from "./sections/project-info"
import { ZeroCarbonStepCompliance } from "./sections/zero-carbon-step-compliance"

interface IProps {
  checklist: IPart9StepCodeChecklist
}
export function Part9Report({ checklist }: IProps) {
  return (
    <div>
      <div>
        <ProjectInfo checklist={checklist} />
        <BuildingInfo checklist={checklist} />
        <ComplianceSummary checklist={checklist} />
        <CompletedBy checklist={checklist} />
        <BuildingCharacteristicsSummary checklist={checklist} />
        <EnergyPerformanceCompliance checklist={checklist} />
        {checklist.selectedReport?.energy ? (
          <EnergyStepCompliance report={checklist.selectedReport.energy} />
        ) : (
          <section>
            <h2>Energy step-code compliance</h2>
            <p>No saved compliance report is available.</p>
          </section>
        )}
        {checklist.selectedReport?.zeroCarbon ? (
          <ZeroCarbonStepCompliance report={checklist.selectedReport.zeroCarbon} />
        ) : (
          <section>
            <h2>Zero-carbon step-code compliance</h2>
            <p>No saved compliance report is available.</p>
          </section>
        )}
      </div>
    </div>
  )
}
