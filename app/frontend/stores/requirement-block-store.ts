import { t } from "i18next"
import { Instance, cast, flow, toGenerator, types } from "mobx-state-tree"
import * as R from "ramda"
import { createSearchModel } from "../lib/create-search-model"
import { withEnvironment } from "../lib/with-environment"
import { withRootStore } from "../lib/with-root-store"
import { RequirementBlockModel } from "../models/requirement-block"
import { ERequirementLibrarySortFields } from "../types/enums"

export const RequirementBlockStore = types
  .compose(
    types.model("RequirementBlockStore").props({
      requirementBlockMap: types.map(RequirementBlockModel),
      tableRequirementBlocks: types.array(types.safeReference(RequirementBlockModel)),
    }),
    createSearchModel<ERequirementLibrarySortFields>("fetchRequirementBlocks")
  )
  .extend(withEnvironment())
  .extend(withRootStore())
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
        R.map((requirementBlock) => self.requirementBlockMap.put(requirementBlock), response.data.data)
        self.tableRequirementBlocks = cast(response.data.data.map((requirementBlock) => requirementBlock.id))
        self.currentPage = opts?.page ?? self.currentPage
        self.totalPages = response.data.meta.totalPages
        self.totalCount = response.data.meta.totalCount
        self.countPerPage = opts?.countPerPage ?? self.countPerPage
      }
      return response.ok
    }),
  }))

export interface IRequirementBlockStore extends Instance<typeof RequirementBlockStore> {}
