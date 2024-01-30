import { t } from "i18next"
import { Instance, cast, flow, toGenerator, types } from "mobx-state-tree"
import * as R from "ramda"
import { TCreateRequirementTemplateFormData } from "../components/domains/requirement-template/new-requirement-tempate-screen"
import { createSearchModel } from "../lib/create-search-model"
import { withEnvironment } from "../lib/with-environment"
import { withRootStore } from "../lib/with-root-store"
import { RequirementTemplateModel } from "../models/requirement-template"
import { ERequirementTemplateSortFields } from "../types/enums"
import { toCamelCase } from "../utils/utility-funcitons"

export const RequirementTemplateStore = types
  .compose(
    types.model("RequirementTemplateStore").props({
      requirementTemplateMap: types.map(RequirementTemplateModel),
      tableRequirementTemplates: types.array(types.safeReference(RequirementTemplateModel)),
    }),
    createSearchModel<ERequirementTemplateSortFields>("fetchRequirementTemplates")
  )
  .extend(withEnvironment())
  .extend(withRootStore())
  .views((self) => ({
    // View to get a RequirementTemplate by id
    getRequirementTemplateById(id: string) {
      return self.requirementTemplateMap.get(id)
    },
    getSortColumnHeader(field: ERequirementTemplateSortFields) {
      //@ts-ignore
      return t(`requirementTemplate.fields.${toCamelCase(field)}`)
    },
  }))

  .actions((self) => ({
    fetchRequirementTemplates: flow(function* (opts?: { reset?: boolean; page?: number; countPerPage?: number }) {
      if (opts?.reset) {
        self.resetPages()
      }

      const response = yield* toGenerator(
        self.environment.api.fetchRequirementTemplates({
          query: self.query,
          sort: self.sort,
          page: opts?.page ?? self.currentPage,
          perPage: opts?.countPerPage ?? self.countPerPage,
        })
      )

      if (response.ok) {
        R.map((requirementTemplate) => self.requirementTemplateMap.put(requirementTemplate), response.data.data)
        self.tableRequirementTemplates = cast(response.data.data.map((requirementTemplate) => requirementTemplate.id))
        self.currentPage = opts?.page ?? self.currentPage
        self.totalPages = response.data.meta.totalPages
        self.totalCount = response.data.meta.totalCount
        self.countPerPage = opts?.countPerPage ?? self.countPerPage
      }
      return response.ok
    }),
    createRequirementTemplate: flow(function* (formData: TCreateRequirementTemplateFormData) {
      const { ok, data: response } = yield* toGenerator(self.environment.api.createRequirementTemplate(formData))

      if (ok) {
        self.requirementTemplateMap.put(response.data)
        return response.data
      }
    }),
    fetchPermitTypeOptions: flow(function* () {
      // Jurisdiction not found in the map, fetch from API
      const { ok, data: response } = yield self.environment.api.fetchPermitTypeOptions()
      return response.data
    }),
    fetchActivityOptions: flow(function* () {
      // Jurisdiction not found in the map, fetch from API
      const { ok, data: response } = yield self.environment.api.fetchActivityOptions()
      return response.data
    }),
  }))

export interface IRequirementTemplateStore extends Instance<typeof RequirementTemplateStore> {}
