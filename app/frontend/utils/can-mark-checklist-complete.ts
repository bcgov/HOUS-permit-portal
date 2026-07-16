/** True when every relevant section except `report` is complete. */
export function canMarkChecklistComplete(
  sectionCompletionStatus: Record<string, { complete?: boolean; relevant?: boolean }> | null | undefined
): boolean {
  return Object.entries(sectionCompletionStatus ?? {}).every(
    ([key, section]) => key === "report" || !section?.relevant || section?.complete
  )
}
