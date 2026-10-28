import { IFormJson, ISubmissionData } from "../types/types"
import { getRequirementByKey } from "./formio-component-traversal"
import { compareSubmissionData, isRequirementInputComponent } from "./formio-helpers"

export const additionalChangeFields = ({
  formJson,
  beforeSubmissionData,
  afterSubmissionData,
  excludeKeys,
}: {
  formJson?: IFormJson | null
  beforeSubmissionData?: ISubmissionData | null
  afterSubmissionData?: ISubmissionData | null
  excludeKeys: string[]
}) => {
  if (!formJson || !beforeSubmissionData || !afterSubmissionData) return []

  const excluded = new Set(excludeKeys)
  return compareSubmissionData(beforeSubmissionData, afterSubmissionData).flatMap((key) => {
    if (key === "section-completion-key" || excluded.has(key)) return []

    const requirement = getRequirementByKey(formJson, key)
    if (!requirement || !isRequirementInputComponent(requirement)) return []

    return [{ key, label: requirement.label || key }]
  })
}
