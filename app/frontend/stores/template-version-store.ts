import { Instance, types } from "mobx-state-tree"
import { withEnvironment } from "../lib/with-environment"
import { withMerge } from "../lib/with-merge"
import { withRootStore } from "../lib/with-root-store"
import { TemplateVersionModel } from "../models/template-version"

export const TemplateVersionStoreModel = types
  .model("TemplateVersionStoreModel")
  .props({
    templateVersionMap: types.map(TemplateVersionModel),
  })
  .extend(withEnvironment())
  .extend(withRootStore())
  .extend(withMerge())
  .views((self) => ({
    // View to get a RequirementTemplate by id
    getTemplateVersionById(id: string) {
      return self.templateVersionMap.get(id)
    },
  }))

export interface ITemplateVersionStoreModel extends Instance<typeof TemplateVersionStoreModel> {}
