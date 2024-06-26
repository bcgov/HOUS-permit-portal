import { flow } from "mobx"
import { Instance, toGenerator, types } from "mobx-state-tree"
import { withEnvironment } from "../lib/with-environment"
import { IRequirementMap, ISimplifiedRequirementsMap } from "../types/types"
import { IRequirementBlockMapping, RequirementsMapping } from "./requirement-block-mapping"
import { TemplateVersionModel } from "./template-version"

type TRawRequirementsMapping = Record<string, { id: string; requirements: Record<string, IRequirementMap> }>

export const IntegrationMappingModel = types.snapshotProcessor(
  types
    .model("IntegrationMappingModel")
    .props({
      // this needs to be string as the IntegrationMappingModel needs to be stored in
      // a map where the key is not it's own id
      id: types.string,
      templateVersion: types.reference(types.late(() => TemplateVersionModel)),
      jurisdictionId: types.string,
      requirementsMapping: RequirementsMapping,
      query: types.maybeNull(types.string),
      showOnlyUnmapped: types.optional(types.boolean, false),
      isAllAccordionCollapsed: types.optional(types.boolean, false),
    })
    .extend(withEnvironment())
    .views((self) => ({
      get tableRequirementsMapping() {
        const filteredRequirementsMapping = (
          Array.from(self.requirementsMapping.values()) as IRequirementBlockMapping[]
        ).filter((r) => r.hasAnyMatchesAfterQuery)

        if (!self.query?.trim()) {
          return filteredRequirementsMapping
        }

        return filteredRequirementsMapping.sort((a, b) => a.bestSearchScore - b.bestSearchScore)
      },
    }))
    .actions((self) => ({
      setIsAllAccordionCollapsed(isCollapsed: boolean) {
        self.isAllAccordionCollapsed = isCollapsed
      },
      setShowOnlyUnmapped(showOnlyUnmapped: boolean) {
        self.showOnlyUnmapped = showOnlyUnmapped
      },
      setQuery(query: string | null) {
        self.query = query?.trim()
      },
      /**
       * Merges existing requirements mapping model with an updated raw requirements mapping from the api.
       *
       * @param simplifiedRequirementsMap - An object representing the simplified requirements map.
       * @param updatedRawRequirementsMapping - An object representing the updated raw requirements mapping from the api.
       *
       * This function iterates over the entries of the simplified requirements map. For each entry, it retrieves the corresponding
       * requirement block mapping from the model's requirements mapping. If a requirement block mapping exists, it updates the requirements
       * with the updated mapping.
       *
       * The updated requirements are then updated into the requirement block mapping.
       */
      mergeExistingRequirementsMapping(
        simplifiedRequirementsMap: ISimplifiedRequirementsMap,
        updatedRawRequirementsMapping: TRawRequirementsMapping
      ) {
        for (const [requirementBlockSku, simplifiedRequirementMap] of Object.entries(simplifiedRequirementsMap)) {
          const requirementBlockMapping = self.requirementsMapping.get(requirementBlockSku)

          // the mapping should always exist, but if it doesn't, we can noop
          if (!requirementBlockMapping) {
            continue
          }

          const updatedRequirements = Object.entries(simplifiedRequirementMap).reduce<Record<string, IRequirementMap>>(
            (acc, [requirementCode, localSystemMapping]) => {
              const updatedRequirement =
                updatedRawRequirementsMapping[requirementBlockSku]?.requirements[requirementCode]

              if (updatedRequirement) {
                acc[requirementCode] = updatedRequirement
              }

              return acc
            },
            {}
          )
          requirementBlockMapping.mergeRequirements(updatedRequirements)
        }
      },
    }))
    .actions((self) => ({
      updateRequirementsMapping: flow(function* (simplifiedRequirementsMapping: ISimplifiedRequirementsMap) {
        const response = yield* toGenerator(
          self.environment.api.updateIntegrationMapping(self.id, {
            simplifiedMap: simplifiedRequirementsMapping,
          })
        )

        if (!response.ok || !response.data?.data) {
          return false
        }

        const integrationMapping = response.data.data

        self.mergeExistingRequirementsMapping(
          simplifiedRequirementsMapping,
          // hack needed to preserve casing of the hash
          // @ts-ignore
          JSON.parse(integrationMapping.requirementsMappingJson) as TRawRequirementsMapping
        )

        return true
      }),
      dummyFetch() {},
    })),
  {
    preProcessor,
  }
)

function preProcessor(snapshot) {
  let requirementsMapping = snapshot.requirementsMappingJson
    ? JSON.parse(snapshot.requirementsMappingJson)
    : snapshot.requirementsMapping

  for (let [sku, requirementBlockMapping] of Object.entries(requirementsMapping)) {
    ;(requirementBlockMapping as any).sku = sku

    Object.entries((requirementBlockMapping as any)?.requirements ?? {}).forEach(
      ([requirementCode, requirementMapping]) => {
        ;(requirementMapping as any).requirementCode = requirementCode
      }
    )
  }

  return {
    ...snapshot,
    // hack so to get uncamelized codes
    requirementsMapping,
    templateVersion: snapshot.templateVersionId,
  }
}

export interface IIntegrationMapping extends Instance<typeof IntegrationMappingModel> {}
