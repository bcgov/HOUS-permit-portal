import { Instance, types } from "mobx-state-tree"
import { withRootStore } from "../lib/with-root-store"
import { IRequirementTemplate } from "./requirement-template"

export const TemplateCategoryModel = types
  .model("TemplateCategoryModel", {
    id: types.identifier,
    label: types.string,
    sortOrder: types.number,
    createdAt: types.Date,
    updatedAt: types.Date,
    requirementTemplateIds: types.optional(types.array(types.string), []),
  })
  .extend(withRootStore())
  .views((self) => ({
    get requirementTemplates() {
      return self.requirementTemplateIds
        .map((id) => self.rootStore.requirementTemplateStore.getRequirementTemplateById(id))
        .filter(Boolean) as IRequirementTemplate[]
    },
  }))
  .actions((self) => ({
    // The category payload is the full visible list. Deep-merging the id array
    // would keep a template that a later response dropped, such as one just archived.
    setRequirementTemplateIds(ids: string[]) {
      self.requirementTemplateIds.replace(ids)
    },
  }))

export interface ITemplateCategory extends Instance<typeof TemplateCategoryModel> {}
