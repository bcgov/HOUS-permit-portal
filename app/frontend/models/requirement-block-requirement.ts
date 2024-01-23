import { Instance, types } from "mobx-state-tree"
import { RequirementModel } from "./requirement"

export const RequirementBlockRequirementModel = types.model("RequirementBlockRequirementModel", {
  id: types.identifier,
  requirement: RequirementModel,
})

export interface IRequirementBlockRequirement extends Instance<typeof RequirementBlockRequirementModel> {}
