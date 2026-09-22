import React from "react"
import { IPart3StepCodeChecklist } from "../../../../models/part-3-step-code-checklist"
import { isBaselineChecklist, isMixedUseChecklist } from "../../../../utils/utility-functions"
import { MixedUseSummary } from "./sections/mixed-use-summary"
import { ProjectInfo } from "./sections/project-info/index"
import { StepCodePerformanceSummary } from "./sections/step-code-performance-summary/index"

interface IProps {
  checklist: IPart3StepCodeChecklist
  stepCode?: { fullAddress?: string; jurisdictionName?: string; updatedAt?: Date }
}

export const Part3Report = function Part3PrintReport({ checklist, stepCode }: IProps) {
  // Select the same report variants as the existing domain report.
  const isMixedUse = isMixedUseChecklist(checklist as any)
  const isBaseline = isBaselineChecklist(checklist as any)
  // Snapshot project details may be unavailable; never substitute current data.
  const reportProject = {
    ...(stepCode ?? {}),
    currentStage: checklist.stage,
    updatedAt: checklist.updatedAt ?? stepCode?.updatedAt,
  }
  return (
    <div>
      <div>
        <ProjectInfo stepCode={reportProject} />

        <StepCodePerformanceSummary checklist={checklist} />

        {(isMixedUse || isBaseline) && <MixedUseSummary checklist={checklist} />}
      </div>
    </div>
  )
}
