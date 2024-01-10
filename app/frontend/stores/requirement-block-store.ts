import { t } from "i18next"
import { Instance, cast, flow, toGenerator, types } from "mobx-state-tree"
import * as R from "ramda"
import { withEnvironment } from "../lib/with-environment"
import { withRootStore } from "../lib/with-root-store"
import { RequirementBlockModel } from "../models/requirement-block"
import { ERequirementLibrarySortFields, ESortDirection } from "../types/enums"
import { ISort } from "../types/types"

export const RequirementBlockStore = types
  .model("RequirementBlockStore")
  .props({
    requirementBlockMap: types.map(RequirementBlockModel),
    tableRequirementBlocks: types.array(types.safeReference(RequirementBlockModel)),
    query: types.maybeNull(types.string),
    sort: types.maybeNull(types.frozen<ISort<ERequirementLibrarySortFields>>()),
    currentPage: types.optional(types.number, 1),
    totalPages: types.maybeNull(types.number),
    totalCount: types.maybeNull(types.number),
    countPerPage: types.optional(types.number, 10),
    isQuerying: types.optional(types.boolean, false),
  })
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
    resetPages() {
      self.currentPage = 1
      self.totalPages = null
      self.totalCount = null
    },
  }))
  .actions((self) => ({
    setCountPerPage(countPerPage: number) {
      self.countPerPage = countPerPage
    },
    setQuery(query: string) {
      self.query = !!query?.trim() ? query : null
    },
    fetchRequirementBlocks: flow(function* (opts?: { reset?: boolean; page?: number }) {
      self.isQuerying = true
      if (opts?.reset) {
        self.resetPages()
      }

      const response = yield* toGenerator(
        self.environment.api.fetchRequirementBlocks({
          query: self.query,
          sort: self.sort,
          page: opts?.page ?? self.currentPage,
          perPage: self.countPerPage,
        })
      )

      self.isQuerying = false

      if (response.ok) {
        R.map((requirementBlock) => self.requirementBlockMap.put(requirementBlock), response.data.data)
        self.tableRequirementBlocks = cast(response.data.data.map((requirementBlock) => requirementBlock.id))
        self.currentPage = opts?.page ?? self.currentPage
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
      return yield self.fetchRequirementBlocks()
    }),
    clearSort: flow(function* () {
      self.sort = null
      return yield self.fetchRequirementBlocks()
    }),
  }))
  .actions((self) => ({
    toggleSort: flow(function* (sortField: ERequirementLibrarySortFields) {
      // calculate the next sort state based on current sort
      // descending -> ascending -> unsorted
      if (self.sort && self.sort.field == sortField && self.sort.direction == ESortDirection.ascending) {
        // return to unsorted state
        yield self.clearSort()
      } else {
        // apply the next sort state
        const direction =
          self.sort?.field == sortField && self.sort?.direction == ESortDirection.descending
            ? ESortDirection.ascending
            : ESortDirection.descending
        yield self.applySort({ field: sortField, direction })
      }
    }),
  }))

export interface IRequirementBlockStore extends Instance<typeof RequirementBlockStore> {}
