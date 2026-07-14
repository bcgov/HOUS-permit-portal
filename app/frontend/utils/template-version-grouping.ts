import { ITemplateVersion } from "../models/template-version"

export interface ITemplateVersionGroup {
  id: string
  label: string
  sortOrder: number
  templateVersions: ITemplateVersion[]
}

const UNCATEGORIZED_GROUP: Omit<ITemplateVersionGroup, "templateVersions"> = {
  id: "uncategorized",
  label: "Other",
  sortOrder: Number.MAX_SAFE_INTEGER,
}

export function groupTemplateVersionsByCategory(templateVersions: ITemplateVersion[]): ITemplateVersionGroup[] {
  const groups = new Map<string, ITemplateVersionGroup>()

  templateVersions.forEach((templateVersion) => {
    const category = categoryForTemplateVersion(templateVersion)
    const existingGroup = groups.get(category.id)

    if (existingGroup) {
      existingGroup.templateVersions.push(templateVersion)
    } else {
      groups.set(category.id, { ...category, templateVersions: [templateVersion] })
    }
  })

  return Array.from(groups.values())
    .map((group) => ({
      ...group,
      templateVersions: group.templateVersions.slice().sort(compareTemplateVersions),
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label))
}

function categoryForTemplateVersion(
  templateVersion: ITemplateVersion
): Omit<ITemplateVersionGroup, "templateVersions"> {
  const category = templateVersion.summary?.templateCategory

  if (!category) return UNCATEGORIZED_GROUP

  return {
    id: category.id,
    label: category.label,
    sortOrder: category.sortOrder,
  }
}

function compareTemplateVersions(a: ITemplateVersion, b: ITemplateVersion) {
  const aSortOrder = a.summary?.sortOrder ?? 0
  const bSortOrder = b.summary?.sortOrder ?? 0

  return aSortOrder - bSortOrder || a.label.localeCompare(b.label)
}
