import { Instance, types } from "mobx-state-tree"
import { RequirementModel } from "./requirement"

export const RequirementBlockModel = types.model("RequirementBlockModel", {
  id: types.identifier,
  name: types.string,
  displayName: types.string,
  requirements: types.array(RequirementModel),
  associations: types.array(types.string),
  description: types.maybeNull(types.string),
  displayDescription: types.maybeNull(types.string),
  createdAt: types.Date,
  updatedAt: types.Date,
})

export interface IRequirementBlock extends Instance<typeof RequirementBlockModel> {}
