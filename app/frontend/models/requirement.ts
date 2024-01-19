import { Instance, types } from "mobx-state-tree"

export const RequirementModel = types.model("RequirementModel", {
  id: types.string,
  label: types.string,
  createdAt: types.Date,
  updatedAt: types.Date,
})

export interface IRequirement extends Instance<typeof RequirementModel> {}
