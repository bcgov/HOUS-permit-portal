import { flow } from "mobx"
import { Instance, toGenerator, types } from "mobx-state-tree"
import { withEnvironment } from "../lib/with-environment"
import { IRequirementsMapping, ISimplifiedRequirementsMap } from "../types/types"

export const IntegrationMappingModel = types
  .model("IntegrationMappingModel")
  .props({
    // this needs to be string as the IntegrationMappingModel needs to be stored in
    // a map where the key is not it's own id
    id: types.string,
    jurisdictionId: types.string,
    templateVersionId: types.string,
    requirementsMapping: types.frozen<IRequirementsMapping>({}),
  })
  .extend(withEnvironment())
  .actions((self) => ({
    setRequirementsMapping(requirementsMapping: IRequirementsMapping) {
      self.requirementsMapping = requirementsMapping
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

      const integrationMapping = response.data.data as IIntegrationMapping

      self.setRequirementsMapping(integrationMapping.requirementsMapping)

      return true
    }),
  }))

export interface IIntegrationMapping extends Instance<typeof IntegrationMappingModel> {}
