import { flow, Instance, toGenerator, types } from "mobx-state-tree"
import { withEnvironment } from "../lib/with-environment"
import { withMerge } from "../lib/with-merge"
import { withRootStore } from "../lib/with-root-store"
import { TemplateVersionModel } from "../models/template-version"

export const TemplateVersionStoreModel = types
  .model("TemplateVersionStoreModel")
  .props({
    templateVersionMap: types.map(TemplateVersionModel),
    templateVersionsByActivityId: types.map(types.array(types.safeReference(TemplateVersionModel))),
  })
  .extend(withEnvironment())
  .extend(withRootStore())
  .extend(withMerge())
  .views((self) => ({
    get templateVersions() {
      return Array.from(self.templateVersionMap.values())
    },
  }))
  .views((self) => ({
    // View to get a RequirementTemplate by id
    getTemplateVersionById(id: string) {
      return self.templateVersionMap.get(id)
    },
    getTemplateVersionsByActivityId: (permitTypeId: string) => {
      return self.templateVersionsByActivityId.get(permitTypeId) ?? []
    },
  }))
  .actions((self) => ({
    fetchTemplateVersions: flow(function* (activityId?: string) {
      const response = yield* toGenerator(self.environment.api.fetchTemplateVersions(activityId))

      if (response.ok) {
        const templateVersions = response.data.data

        templateVersions.forEach((version) => {
          version.isFullyLoaded = true
        })
        self.mergeUpdateAll(templateVersions, "templateVersionMap")

        !!activityId &&
          self.templateVersionsByActivityId.set(
            activityId,
            templateVersions.map((templateVersion) => templateVersion.id)
          )
      }

      return response.ok
    }),

    fetchTemplateVersion: flow(function* (id: string) {
      const response = yield* toGenerator(self.environment.api.fetchTemplateVersion(id))

      if (response.ok) {
        const templateVersion = response.data.data

        templateVersion.isFullyLoaded = true

        self.mergeUpdate(templateVersion, "templateVersionMap")

        return self.getTemplateVersionById(templateVersion.id)
      }
      return response.ok
    }),
  }))

export interface ITemplateVersionStoreModel extends Instance<typeof TemplateVersionStoreModel> {}
