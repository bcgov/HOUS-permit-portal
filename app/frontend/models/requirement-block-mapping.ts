import { Instance, types } from "mobx-state-tree"
import { IRequirementMap } from "../types/types"

const RequirementBlockMappingModel = types
  .model("RequirementBlockMappingModel")
  .props({
    id: types.string,
    requirements: types.map(types.frozen<IRequirementMap>()),
  })
  .actions((self) => ({
    mergeRequirements: (requirements: Record<string, IRequirementMap>) => {
      for (const [key, value] of Object.entries(requirements)) {
        self.requirements.set(key, value)
      }
    },
  }))

export const RequirementsMapping = types.map(RequirementBlockMappingModel)

export interface IRequirementBlockMapping extends Instance<typeof RequirementBlockMappingModel> {}

export interface IRequirementsMapping extends Instance<typeof RequirementsMapping> {}
