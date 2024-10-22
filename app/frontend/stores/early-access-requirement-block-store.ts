import { Instance, cast, flow, toGenerator, types } from "mobx-state-tree"
import { createSearchModel } from "../lib/create-search-model"
import { withEnvironment } from "../lib/with-environment"
import { withMerge } from "../lib/with-merge"
import { withRootStore } from "../lib/with-root-store"
import { RequirementBlockModel } from "../models/requirement-block"
import { ERequirementLibrarySortFields, EVisibility } from "../types/enums"

export const EarlyAccessRequirementBlockStoreModel = types
  .compose(
    types.model("EarlyAccessRequirementBlockStoreModel").props({
      tableEarlyAccessRequirementBlocks: types.array(types.safeReference(RequirementBlockModel)),
    }),
    createSearchModel<ERequirementLibrarySortFields>("fetchEarlyAccessRequirementBlocks")
  )
  .extend(withEnvironment())
  .extend(withRootStore())
  .extend(withMerge())
  .views((self) => ({
    get tableRequirementBlocks() {
      return self.tableEarlyAccessRequirementBlocks
    },
  }))
  .actions((self) => ({
    fetchEarlyAccessRequirementBlocks: flow(function* (opts?: {
      reset?: boolean
      page?: number
      countPerPage?: number
    }) {
      if (opts?.reset) {
        self.resetPages()
      }

      const response = yield* toGenerator(
        self.environment.api.fetchRequirementBlocks({
          query: self.query,
          sort: self.sort,
          page: opts?.page ?? self.currentPage,
          showArchived: self.showArchived,
          visibility: EVisibility.earlyAccess,
          perPage: opts?.countPerPage ?? self.countPerPage,
        })
      )

      if (response.ok) {
        self.rootStore.requirementBlockStore.mergeUpdateAll(response.data.data, "requirementBlockMap")
        self.tableEarlyAccessRequirementBlocks = cast(response.data.data.map((requirementBlock) => requirementBlock.id))
        self.currentPage = opts?.page ?? self.currentPage
        self.totalPages = response.data.meta.totalPages
        self.totalCount = response.data.meta.totalCount
        self.countPerPage = opts?.countPerPage ?? self.countPerPage
      }
      return response.ok
    }),
  }))

export interface IEarlyAccessRequirementBlockStoreModel
  extends Instance<typeof EarlyAccessRequirementBlockStoreModel> {}
