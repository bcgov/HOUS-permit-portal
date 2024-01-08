import { Instance, types } from "mobx-state-tree"

export const RequirementModel = types.model("RequirementBlockModel", {
  id: types.identifier,
  label: types.string,
  createdAt: types.Date,
  updatedAt: types.Date,
})

export interface IRequirement extends Instance<typeof RequirementModel> {}
