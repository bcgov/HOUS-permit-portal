import { IFormIORequirement, ISingleRequirementFormJson } from "../types/types"

export const singleRequirementFormJson = (requirementJson: IFormIORequirement): ISingleRequirementFormJson => {
  requirementJson.conditional = null
  requirementJson.customConditional = null

  return {
    id: requirementJson.id,
    key: `single-${requirementJson.key}`,
    components: [requirementJson],
  }
}

export const isFieldSetKey = (key: string) => {
  return key.split("|").length === 4
}
