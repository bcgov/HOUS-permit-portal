import { Instance, types } from "mobx-state-tree"

export const RequirementBlockModel = types.model("RequirementBlockModel", {
  id: types.identifier,
  name: types.string,
  description: types.maybeNull(types.string),
  createdAt: types.Date,
  updatedAt: types.Date,
})

export interface IRequirementBlock extends Instance<typeof RequirementBlockModel> {}
