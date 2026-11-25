import type { IPart3SectionCompletionStatus, IPart9SectionCompletionStatus } from "../types/types"

type SectionCompletion = { complete?: boolean; relevant?: boolean }
type ChecklistCompletionStatus =
  | IPart3SectionCompletionStatus
  | IPart9SectionCompletionStatus
  | Record<string, SectionCompletion>

/** True when every relevant section is complete, ignoring `excludedKeys`. */
export function areRelevantSectionsCompleteExcept(
  sectionCompletionStatus: ChecklistCompletionStatus | null | undefined,
  excludedKeys: string[]
): boolean {
  return (Object.entries(sectionCompletionStatus ?? {}) as [string, SectionCompletion][]).every(
    ([key, section]) => excludedKeys.includes(key) || !section?.relevant || section?.complete
  )
}

/** True when every relevant section except `report` is complete. */
export function canMarkChecklistComplete(
  sectionCompletionStatus: ChecklistCompletionStatus | null | undefined
): boolean {
  return areRelevantSectionsCompleteExcept(sectionCompletionStatus, ["report"])
}
