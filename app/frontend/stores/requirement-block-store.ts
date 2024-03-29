import { t } from "i18next"
import { Instance, cast, flow, toGenerator, types } from "mobx-state-tree"
import { createSearchModel } from "../lib/create-search-model"
import { withEnvironment } from "../lib/with-environment"
import { withMerge } from "../lib/with-merge"
import { withRootStore } from "../lib/with-root-store"
import { RequirementBlockModel } from "../models/requirement-block"
import { IRequirementBlockParams } from "../types/api-request"
import { ERequirementLibrarySortFields, ETagType } from "../types/enums"

export const RequirementBlockStoreModel = types
  .compose(
    types.model("RequirementBlockStoreModel").props({
      requirementBlockMap: types.map(RequirementBlockModel),
      tableRequirementBlocks: types.array(types.safeReference(RequirementBlockModel)),
    }),
    createSearchModel<ERequirementLibrarySortFields>("fetchRequirementBlocks")
  )
  .extend(withEnvironment())
  .extend(withRootStore())
  .extend(withMerge())
  .views((self) => ({
    // View to get a RequirementBlock by id
    getRequirementBlockById(id: string) {
      return self.requirementBlockMap.get(id)
    },
    getSortColumnHeader(field: ERequirementLibrarySortFields) {
      switch (field) {
        case ERequirementLibrarySortFields.name:
          return t("requirementsLibrary.fields.name")
        case ERequirementLibrarySortFields.associations:
          return t("requirementsLibrary.fields.associations")
        case ERequirementLibrarySortFields.requirementLabels:
          return t("requirementsLibrary.fields.formFields")
        case ERequirementLibrarySortFields.updatedAt:
          return t("requirementsLibrary.fields.updatedAt")
        case ERequirementLibrarySortFields.configurations:
          return t("requirementsLibrary.configurationsColumn")
      }
    },
  }))

  .actions((self) => ({
    fetchRequirementBlocks: flow(function* (opts?: { reset?: boolean; page?: number; countPerPage?: number }) {
      if (opts?.reset) {
        self.resetPages()
      }

      const response = yield* toGenerator(
        self.environment.api.fetchRequirementBlocks({
          query: self.query,
          sort: self.sort,
          page: opts?.page ?? self.currentPage,
          perPage: opts?.countPerPage ?? self.countPerPage,
        })
      )

      if (response.ok) {
        self.mergeUpdateAll(response.data.data, "requirementBlockMap")
        self.tableRequirementBlocks = cast(response.data.data.map((requirementBlock) => requirementBlock.id))
        self.currentPage = opts?.page ?? self.currentPage
        self.totalPages = response.data.meta.totalPages
        self.totalCount = response.data.meta.totalCount
        self.countPerPage = opts?.countPerPage ?? self.countPerPage
      }
      return response.ok
    }),
  }))
  .actions((self) => ({
    createRequirementBlock: flow(function* (requirementParams: IRequirementBlockParams) {
      const response = yield* toGenerator(self.environment.api.createRequirementBlock(requirementParams))

      if (response.ok) {
        self.requirementBlockMap.put(response.data.data)

        // Get latest data for current page, sort and filters
        yield self.fetchRequirementBlocks()

        return true
      }

      return false
    }),
    searchAssociations: flow(function* (query: string) {
      const response = yield* toGenerator(
        self.environment.api.searchTags({
          query,
          taggableTypes: [ETagType.requirementBlock],
        })
      )

      if (response.ok) {
        return response.data
      }

      return []
    }),
  }))

export interface IRequirementBlockStoreModel extends Instance<typeof RequirementBlockStoreModel> {}
