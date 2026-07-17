import { EStepCodeChecklistStage, EStepCodeChecklistStatus, EStepCodeStageStatus } from "../types/enums"

/** Mirrors StepCodeChecklistStageCompletion.status_for — prefer live checklist status over API snapshot. */
export function stageStatusFor(
  stage: EStepCodeChecklistStage,
  checklists: Array<{ stage?: string; status?: string }>,
  stageCompletions: Array<{ stage: string; status: EStepCodeStageStatus }> = []
): EStepCodeStageStatus {
  const checklist = checklists.find((entry) => entry.stage === stage)
  if (checklist) {
    return checklist.status === EStepCodeChecklistStatus.complete
      ? EStepCodeStageStatus.complete
      : EStepCodeStageStatus.inProgress
  }

  return stageCompletions.find((entry) => entry.stage === stage)?.status ?? EStepCodeStageStatus.notStarted
}
