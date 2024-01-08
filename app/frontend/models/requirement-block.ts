import { Instance, types } from "mobx-state-tree"
import { RequirementModel } from "./requirement"

export const RequirementBlockModel = types
  .model("RequirementBlockModel", {
    id: types.identifier,
    name: types.string,
    requirements: types.array(RequirementModel),
    description: types.maybeNull(types.string),
    createdAt: types.Date,
    updatedAt: types.Date,
  })
  .views((self) => ({
    get alphaSortedRequirements() {
      return self.requirements.slice().sort((a, b) => a.label.localeCompare(b.label))
    },
  }))

export interface IRequirementBlock extends Instance<typeof RequirementBlockModel> {}
