import { IOption } from "../types/types"

export const UNCATEGORIZED_FILTER_GROUP_ID = "uncategorized"

export interface IFilterOptionGroup<TValue = string> {
  id: string
  label: string
  options: IOption<TValue>[]
}

export function groupFilterOptions<TValue = string>(
  options: IOption<TValue>[],
  uncategorizedLabel: string
): IFilterOptionGroup<TValue>[] {
  const groups = new Map<string, IFilterOptionGroup<TValue> & { sortOrder: number }>()

  options.forEach((option) => {
    const id = option.groupId ?? UNCATEGORIZED_FILTER_GROUP_ID
    const label = option.groupLabel ?? uncategorizedLabel
    const sortOrder = option.groupId == null ? Number.MAX_SAFE_INTEGER : (option.groupSortOrder ?? 0)
    const existing = groups.get(id)

    if (existing) {
      existing.options.push(option)
    } else {
      groups.set(id, { id, label, options: [option], sortOrder })
    }
  })

  return Array.from(groups.values())
    .sort((a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label))
    .map(({ id, label, options: grouped }) => ({ id, label, options: grouped }))
}

export function shouldShowFilterGroupLabels(groups: IFilterOptionGroup[]): boolean {
  return groups.length > 1 || groups[0]?.id !== UNCATEGORIZED_FILTER_GROUP_ID
}

export function toggleFilterGroupValues(current: string[], groupValues: string[]): string[] {
  const allSelected = groupValues.length > 0 && groupValues.every((value) => current.includes(value))
  if (allSelected) return current.filter((value) => !groupValues.includes(value))
  return [...new Set([...current, ...groupValues])]
}

export function filterGroupSelectionState(current: string[], groupValues: string[]) {
  const selectedCount = groupValues.filter((value) => current.includes(value)).length
  return {
    isChecked: groupValues.length > 0 && selectedCount === groupValues.length,
    isIndeterminate: selectedCount > 0 && selectedCount < groupValues.length,
  }
}
