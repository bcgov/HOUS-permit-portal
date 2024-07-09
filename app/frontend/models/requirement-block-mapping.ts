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
        includeScore: true,
        ignoreLocation: true,
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
    // Note: a lower score is better. Perfect match is 0
    get bestSearchScore() {
      return self.fuseSearchResults?.[0]?.score
    },
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
      let filteredRequirementsJson = requirementsJson.filter((r) => !!self.requirements.get(r.requirementCode))

      if (showOnlyUnmapped) {
        filteredRequirementsJson = filteredRequirementsJson.filter((r) =>
          shouldShowRequirementByFilter(self.requirements.get(r.requirementCode), showOnlyUnmapped)
        )
      }

      if (!self.hasQuery) {
        return filteredRequirementsJson
      }
      return self.fuseSearchResults?.reduce((acc, fuseResult) => {
        const requirementMapping = fuseResult.item
        const requirementJson = requirementsJson.find((r) => r.requirementCode === requirementMapping.requirementCode)

        if (requirementJson && shouldShowRequirementByFilter(requirementMapping, showOnlyUnmapped)) {
          acc.push({ ...requirementJson, matches: fuseResult.matches })
        }

        return acc
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
