import Fuse, { IFuseOptions } from "fuse.js"
import { getParent, Instance, types } from "mobx-state-tree"
import pluck from "ramda/src/pluck"
import { IDenormalizedRequirement, IRequirementMap } from "../types/types"
import { IIntegrationMapping } from "./integration-mapping"

const RequirementBlockMappingModel = types
  .model("RequirementBlockMappingModel")
  .props({
    id: types.string,
    sku: types.string,
    requirements: types.map(types.frozen<IRequirementMap>()),
  })
  .views((self) => ({
    get requirementsList() {
      return Array.from(self.requirements.values())
    },
  }))
  .views((self) => ({
    get integrationMapping() {
      return getParent(self, 2) as IIntegrationMapping
    },
    get fuseInstance() {
      const fuseOptions: IFuseOptions<IRequirementMap> = {
        includeMatches: true,
        keys: ["requirementCode", "local_system_mapping"],
      }
      return new Fuse(self.requirementsList, fuseOptions)
    },
  }))
  .views((self) => ({
    get tableRequirements() {
      return self.integrationMapping?.query
        ? pluck("item", self.fuseInstance.search(self.integrationMapping?.query))
        : self.requirementsList
    },
  }))
  .views((self) => ({
    getTableRequirementsJson(requirementsJson: IDenormalizedRequirement[]) {
      // console.log("xyd", JSON.stringify(self.fuseInstance.search(self.integrationMapping?.query ?? ""), null, 2))
      return requirementsJson?.filter((r) =>
        self.tableRequirements.find((tr) => tr?.requirementCode === r.requirementCode)
      )
    },
  }))
  .views((self) => ({
    get hasAnyMatchesAfterQuery() {
      if (!self.integrationMapping?.query) {
        return true
      }
    },
  }))
  .actions((self) => ({
    mergeRequirements: (requirements: Record<string, IRequirementMap>) => {
      for (const [key, value] of Object.entries(requirements)) {
        if (!("requirementCode" in value)) {
          // @ts-ignore
          value.requirementCode = key
        }
        self.requirements.set(key, value)
      }
    },
  }))

export const RequirementsMapping = types.map(RequirementBlockMappingModel)

export interface IRequirementBlockMapping extends Instance<typeof RequirementBlockMappingModel> {}

export interface IRequirementsMapping extends Instance<typeof RequirementsMapping> {}
