import { t } from "i18next"
import { Instance, cast, flow, toGenerator, types } from "mobx-state-tree"
import { createSearchModel } from "../lib/create-search-model"
import { withEnvironment } from "../lib/with-environment"
import { withMerge } from "../lib/with-merge"
import { withRootStore } from "../lib/with-root-store"
import { RequirementTemplateModel } from "../models/requirement-template"
import { EEarlyAccessRequirementTemplateSortFields, EVisibility } from "../types/enums"
import { toCamelCase } from "../utils/utility-functions"

export const EarlyAccessRequirementTemplateStoreModel = types
  .compose(
    types.model("EarlyAccessRequirementTemplateStoreModel").props({
      tableEarlyAccessRequirementTemplates: types.array(types.safeReference(RequirementTemplateModel)),
    }),
    createSearchModel<EEarlyAccessRequirementTemplateSortFields>("fetchEarlyAccessRequirementTemplates")
  )
  .extend(withEnvironment())
  .extend(withRootStore())
  .extend(withMerge())
  .views((self) => ({
    getSortColumnHeader(field: EEarlyAccessRequirementTemplateSortFields) {
      //@ts-ignore
      return t(`earlyAccessRequirementTemplate.fields.${toCamelCase(field)}`)
    },
  }))
  .actions((self) => ({
    fetchEarlyAccessRequirementTemplates: flow(function* (opts?: {
      reset?: boolean
      page?: number
      countPerPage?: number
    }) {
      if (opts?.reset) {
        self.resetPages()
      }

      const response = yield* toGenerator(
        self.environment.api.fetchRequirementTemplates({
          query: self.query,
          sort: self.sort,
          page: opts?.page ?? self.currentPage,
          perPage: opts?.countPerPage ?? self.countPerPage,
          showArchived: self.showArchived,
          visibility: EVisibility.earlyAccess,
        })
      )

      if (response.ok) {
        self.rootStore.requirementTemplateStore.mergeUpdateAll(response.data.data, "requirementTemplateMap")
        self.tableEarlyAccessRequirementTemplates = cast(
          response.data.data.map((requirementTemplate) => requirementTemplate.id)
        )
        self.currentPage = opts?.page ?? self.currentPage
        self.totalPages = response.data.meta.totalPages
        self.totalCount = response.data.meta.totalCount
        self.countPerPage = opts?.countPerPage ?? self.countPerPage
      }
      return response.ok
    }),
  }))

export interface IEarlyAccessRequirementTemplateStoreModel
  extends Instance<typeof EarlyAccessRequirementTemplateStoreModel> {}
