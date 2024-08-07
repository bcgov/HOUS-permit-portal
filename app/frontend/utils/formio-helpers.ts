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

  // Helper function to compare two values
  const isDifferent = (value1: any, value2: any): boolean => {
    return !R.equals(value1, value2)
  }

  for (const sectionKey in afterSubmissionData.data) {
    if (afterSubmissionData.data.hasOwnProperty(sectionKey)) {
      const afterSection = afterSubmissionData.data[sectionKey]
      const beforeSection = beforeSubmissionData.data[sectionKey] || {}

      for (const fieldKey in afterSection) {
        if (!afterSection.hasOwnProperty(fieldKey) || !isDifferent(afterSection[fieldKey], beforeSection[fieldKey]))
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
