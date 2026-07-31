/** True when every relevant section is complete, ignoring `excludedKeys`. */
export function areRelevantSectionsCompleteExcept(
  sectionCompletionStatus: Record<string, { complete?: boolean; relevant?: boolean }> | null | undefined,
  excludedKeys: string[]
): boolean {
  return Object.entries(sectionCompletionStatus ?? {}).every(
    ([key, section]) => excludedKeys.includes(key) || !section?.relevant || section?.complete
  )
}

/** True when every relevant section except `report` is complete. */
export function canMarkChecklistComplete(
  sectionCompletionStatus: Record<string, { complete?: boolean; relevant?: boolean }> | null | undefined
): boolean {
  return areRelevantSectionsCompleteExcept(sectionCompletionStatus, ["report"])
}
