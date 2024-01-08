import { t } from "i18next"
import { Instance, cast, flow, toGenerator, types } from "mobx-state-tree"
import * as R from "ramda"
import { withEnvironment } from "../lib/with-environment"
import { withRootStore } from "../lib/with-root-store"
import { RequirementBlockModel } from "../models/requirement-block"
import { ERequirementLibrarySortFields } from "../types/enums"
import { ISort } from "../types/types"

export const RequirementBlockStore = types
  .model("RequirementBlockStore")
  .props({
    requirementBlockMap: types.map(RequirementBlockModel),
    tableRequirementBlocks: types.array(types.safeReference(RequirementBlockModel)),
    query: types.maybeNull(types.string),
    sort: types.maybeNull(types.frozen<ISort<ERequirementLibrarySortFields>>()),
    currentPage: types.maybeNull(types.number),
    totalPages: types.maybeNull(types.number),
    totalCount: types.maybeNull(types.number),
  })
  .extend(withEnvironment())
  .extend(withRootStore())
  .views((self) => ({
    // View to get a RequirementBlock by id
    getRequirementBlockById(id: string) {
      return self.requirementBlockMap.get(id)
    },
    get nextPage() {
      return self.currentPage ?? 0 + 1
    },

    getSortColumnHeader(field: ERequirementLibrarySortFields) {
      switch (field) {
        case ERequirementLibrarySortFields.name:
          return t("requirementsLibrary.fields.name")
        case ERequirementLibrarySortFields.associations:
          return t("requirementsLibrary.fields.associations")
        case ERequirementLibrarySortFields.formFields:
          return t("requirementsLibrary.fields.formFields")
        case ERequirementLibrarySortFields.updatedAt:
          return t("requirementsLibrary.fields.updatedAt")
      }
    },
  }))
  .actions((self) => ({
    resetPages() {
      self.currentPage = null
      self.totalPages = null
      self.totalCount = null
    },
  }))
  .actions((self) => ({
    // Example of an asynchronous action to fetch jurisdictions from an API
    fetchRequirementBlocks: flow(function* (opts?: { reset?: boolean; page?: number }) {
      if (opts?.reset) {
        self.resetPages()
      }

      const response = yield* toGenerator(
        self.environment.api.fetchRequirementBlocks({
          sort: self.sort,
          page: opts?.page ?? self.nextPage,
        })
      )

      if (response.ok) {
        R.map((requirementBlock) => self.requirementBlockMap.put(requirementBlock), response.data.data)
        self.tableRequirementBlocks = cast(response.data.data.map((requirementBlock) => requirementBlock.id))
        self.currentPage = opts?.page ?? self.nextPage
        self.totalPages = response.data.meta.totalPages
        self.totalCount = response.data.meta.totalCount

        return true
      }

      return false
    }),
  }))
  .actions((self) => ({
    applySort: flow(function* (sort: ISort<ERequirementLibrarySortFields>) {
      self.sort = sort
      return yield self.fetchRequirementBlocks({ reset: true })
    }),
    clearSort: flow(function* () {
      self.sort = null
      return yield self.fetchRequirementBlocks({ reset: true })
    }),
  }))

export interface IRequirementBlockStore extends Instance<typeof RequirementBlockStore> {}
