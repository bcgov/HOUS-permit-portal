import { cast, flow, Instance, toGenerator, types } from "mobx-state-tree"
import * as R from "ramda"
import { withEnvironment } from "../lib/with-environment"
import { withMerge } from "../lib/with-merge"
import { withRootStore } from "../lib/with-root-store"
import { TemplateCategoryModel } from "../models/template-category"

export const TemplateCategoryStoreModel = types
  .model("TemplateCategoryStore", {
    templateCategoryMap: types.map(TemplateCategoryModel),
    uncategorizedRequirementTemplateIds: types.optional(types.array(types.string), []),
    isLoading: types.optional(types.boolean, false),
  })
  .extend(withEnvironment())
  .extend(withRootStore())
  .extend(withMerge())
  .actions((self) => ({
    __beforeMergeUpdate(category) {
      if (category.requirementTemplates) {
        self.rootStore.requirementTemplateStore.mergeUpdateAll(category.requirementTemplates, "requirementTemplateMap")

        return R.mergeRight(category, {
          requirementTemplateIds: category.requirementTemplates.map((template) => template.id),
          requirementTemplates: undefined,
        })
      }

      return category
    },
  }))
  .views((self) => ({
    get templateCategories() {
      return Array.from(self.templateCategoryMap.values()).sort((a, b) => a.sortOrder - b.sortOrder)
    },

    get uncategorizedRequirementTemplates() {
      return self.uncategorizedRequirementTemplateIds
        .map((id) => self.rootStore.requirementTemplateStore.getRequirementTemplateById(id))
        .filter(Boolean)
    },
  }))
  .actions((self) => {
    const mergeTemplateCategoryResponse = (response) => {
      if (!response?.ok) return false

      const categories = response.data.data ?? []
      const uncategorizedTemplates = response.data.meta?.uncategorizedRequirementTemplates ?? []
      const categoryIds = new Set(categories.map((category) => category.id))

      Array.from(self.templateCategoryMap.keys()).forEach((id) => {
        if (!categoryIds.has(id)) self.templateCategoryMap.delete(id)
      })
      self.mergeUpdateAll(categories, "templateCategoryMap")
      self.rootStore.requirementTemplateStore.mergeUpdateAll(uncategorizedTemplates, "requirementTemplateMap")
      self.uncategorizedRequirementTemplateIds = cast(uncategorizedTemplates.map((template) => template.id))

      return true
    }

    return {
      fetchTemplateCategories: flow(function* () {
        self.isLoading = true
        try {
          const response = yield* toGenerator(self.environment.api.fetchTemplateCategories())
          return mergeTemplateCategoryResponse(response)
        } finally {
          self.isLoading = false
        }
      }),

      createTemplateCategory: flow(function* (label: string) {
        const response = yield* toGenerator(self.environment.api.createTemplateCategory({ label }))
        return mergeTemplateCategoryResponse(response)
      }),

      updateTemplateCategory: flow(function* (id: string, label: string) {
        const response = yield* toGenerator(self.environment.api.updateTemplateCategory(id, { label }))
        return mergeTemplateCategoryResponse(response)
      }),

      deleteTemplateCategory: flow(function* (id: string) {
        const response = yield* toGenerator(self.environment.api.deleteTemplateCategory(id))
        return mergeTemplateCategoryResponse(response)
      }),

      reorderTemplateCategories: flow(function* (orderedIds: string[]) {
        const response = yield* toGenerator(self.environment.api.reorderTemplateCategories(orderedIds))
        return mergeTemplateCategoryResponse(response)
      }),

      reorderTemplatesInCategory: flow(function* (categoryId: string | null, orderedIds: string[]) {
        const response = yield* toGenerator(
          self.environment.api.reorderTemplatesInCategory(categoryId ?? "uncategorized", orderedIds)
        )
        return mergeTemplateCategoryResponse(response)
      }),
    }
  })

export interface ITemplateCategoryStoreModel extends Instance<typeof TemplateCategoryStoreModel> {}
