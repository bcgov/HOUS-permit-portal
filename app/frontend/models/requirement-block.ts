import { Instance, types } from "mobx-state-tree"
import * as R from "ramda"
import { RequirementBlockRequirementModel } from "./requirement-block-requirement"

export const RequirementBlockModel = types
  .model("RequirementBlockModel", {
    id: types.identifier,
    name: types.string,
    displayName: types.string,
    requirementBlockRequirements: types.array(RequirementBlockRequirementModel),
    associations: types.array(types.string),
    description: types.maybeNull(types.string),
    displayDescription: types.maybeNull(types.string),
    createdAt: types.Date,
    updatedAt: types.Date,
  })
  .views((self) => ({
    get requirements() {
      return R.pluck("requirement", self.requirementBlockRequirements)
    },
  }))

export interface IRequirementBlock extends Instance<typeof RequirementBlockModel> {}
