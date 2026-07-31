import * as R from "ramda"
import { FORMIO_DATA_CLASS_PREFIX } from "../constants/formio-constants"
import { IFormIORequirement, ISingleRequirementFormJson, ISubmissionData } from "../types/types"

export const singleRequirementFormJson = (requirementJson: IFormIORequirement): ISingleRequirementFormJson => {
  requirementJson.conditional = null
  requirementJson.customConditional = null

  return {
    id: requirementJson.id,
    key: `single-${requirementJson.key}`,
    components: [requirementJson],
  }
}

export const isNonRequirementKey = (key: string) => {
  if (!key) return true
  const nonRequirementSuffixes = ["revision-button", "change-marker"]
  if (nonRequirementSuffixes.some((suf) => key.endsWith(suf))) return true
  // Injected jurisdiction resources (link/document buttons + labels)
  if (key.includes("-resource-")) return true
  return false
}

/** True for actual answered fields — not content, resource buttons, documents chrome, etc. */
export const isRequirementInputComponent = (requirement: { key?: string; type?: string; input?: boolean }) => {
  if (isNonRequirementKey(requirement?.key)) return false
  if (!requirement?.input) return false
  if (requirement.type === "button" || requirement.type === "content") return false
  return true
}

export const singleRequirementSubmissionData = (submissionData: any, requirementKey: string) => {
  const sectionKey = Object.keys(submissionData.data).find((sk) => submissionData.data[sk][requirementKey])
  if (!sectionKey) return { data: { [requirementKey]: null } }

  return { data: { [requirementKey]: submissionData.data[sectionKey][requirementKey] } }
}

export const isFieldSetKey = (key: string) => {
  return key.split("|").length === 4
}

export const compareSubmissionData = (beforeSubmissionData: ISubmissionData, afterSubmissionData: ISubmissionData) => {
  const changedFields: string[] = []

  if (!beforeSubmissionData) return changedFields

  for (const sectionKey in afterSubmissionData.data) {
    if (afterSubmissionData.data.hasOwnProperty(sectionKey)) {
      const afterSection = afterSubmissionData.data[sectionKey]
      const beforeSection = beforeSubmissionData.data[sectionKey] || {}

      for (const fieldKey in afterSection) {
        if (!afterSection.hasOwnProperty(fieldKey) || R.equals(afterSection[fieldKey], beforeSection[fieldKey]))
          continue

        changedFields.push(fieldKey)
      }
    }
  }

  return changedFields
}

export function getRequirementBlockAccordionNodes() {
  const accordionNodes = document.querySelectorAll<HTMLDivElement>(".formio-component-panel")

  const requirementBlockAssignmentNodes = Array.from(accordionNodes)
    .filter((node) => {
      return (
        node.querySelector(".card-title") &&
        Array.from(node.classList).find((c) => c.startsWith(FORMIO_DATA_CLASS_PREFIX))
      )
    })
    .reduce<{
      [requirementBlockId: string]: HTMLElement
    }>((acc, node) => {
      const titleNode = node.querySelector<HTMLElement>(".card-title")
      const requirementBlockId = Array.from(node.classList)
        .find((c) => c.startsWith(FORMIO_DATA_CLASS_PREFIX))
        .split("|RB")
        .at(-1)

      if (requirementBlockId) {
        acc[requirementBlockId] = titleNode
      }

      return acc
    }, {})

  return requirementBlockAssignmentNodes
}
