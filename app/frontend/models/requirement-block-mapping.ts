import Fuse, { FuseResult, IFuseOptions } from "fuse.js"
import { Instance, getParent, types } from "mobx-state-tree"
import { IDenormalizedRequirement, IRequirementMap } from "../types/types"
import { IIntegrationMapping } from "./integration-mapping"

function shouldShowRequirementByFilter(requirementMap: IRequirementMap, showOnlyUnmapped: boolean) {
  return !showOnlyUnmapped || !requirementMap.local_system_mapping?.trim()
}

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
    get fuseSearchResults() {
      return self.fuseInstance.search(self.integrationMapping?.query ?? "")
    },

    get hasQuery() {
      return !!self.integrationMapping?.query?.trim()
    },
  }))
  .views((self) => ({
    get hasAnyMatchesAfterQuery() {
      if (!self.hasQuery) {
        return true
      }

      return self.fuseSearchResults.length > 0
    },
  }))
  .views((self) => ({
    getTableRequirementsJson(requirementsJson: IDenormalizedRequirement[]): (IDenormalizedRequirement & {
      matches?: FuseResult<IRequirementMap>["matches"]
    })[] {
      const showOnlyUnmapped = self.integrationMapping.showOnlyUnmapped
      const filteredRequirementsJson = showOnlyUnmapped
        ? requirementsJson.filter((r) =>
            shouldShowRequirementByFilter(self.requirements.get(r.requirementCode), showOnlyUnmapped)
          )
        : requirementsJson

      if (!self.hasQuery) {
        return filteredRequirementsJson
      }

      return filteredRequirementsJson?.reduce((acc, requirementJson) => {
        const requirementMapSearchItem = self.fuseSearchResults.find(
          (result) => result.item.requirementCode === requirementJson?.requirementCode
        )

        if (requirementMapSearchItem) {
          acc.push({ ...requirementJson, matches: requirementMapSearchItem.matches })
        }

        return acc.filter((r) =>
          shouldShowRequirementByFilter(self.requirements.get(r.requirementCode), showOnlyUnmapped)
        )
      }, [])
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
