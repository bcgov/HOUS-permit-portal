import { t } from "i18next"
import { Instance, flow, types } from "mobx-state-tree"
import { createSearchModel } from "../lib/create-search-model"
import { withEnvironment } from "../lib/with-environment"
import { withMerge } from "../lib/with-merge"
import { withRootStore } from "../lib/with-root-store"
import { IPreCheck, PreCheckModel } from "../models/pre-check"
import { EPreCheckSortFields } from "../types/enums"
import { TSearchParams } from "../types/types"

export const PreCheckStoreModel = types
  .compose(
    types.model("PreCheckStore", {
      preChecksMap: types.map(PreCheckModel),
      tablePreChecks: types.optional(types.array(types.reference(PreCheckModel)), []),
    }),
    createSearchModel<EPreCheckSortFields>("searchPreChecks", "setPreCheckFilters")
  )
  .extend(withEnvironment())
  .extend(withRootStore())
  .extend(withMerge())
  .views((self) => ({
    getSortColumnHeader(field: EPreCheckSortFields) {
      // @ts-ignore
      return t(`preCheck.columns.${field}`)
    },
  }))
  .actions((self) => ({
    setTablePreChecks(preChecks: IPreCheck[]) {
      // @ts-ignore
      self.tablePreChecks.replace(preChecks.map((s) => s.id))
    },
  }))
  .actions((self) => ({
    searchPreChecks: flow(function* (opts?: { reset?: boolean; page?: number; countPerPage?: number }) {
      if (opts?.reset) {
        self.resetPages()
      }

      const params: TSearchParams<EPreCheckSortFields> = {
        query: self.query,
        sort: self.sort,
        page: opts?.page ?? self.currentPage,
        perPage: opts?.countPerPage ?? self.countPerPage,
      }

      const response = yield self.environment.api.fetchPreChecks(params)
      if (response.ok) {
        self.mergeUpdateAll(response.data.data, "preChecksMap")
        self.setTablePreChecks(response.data.data as any)
        self.setPageFields(response.data.meta, opts)
      } else {
        console.error("Failed to search PreChecks:", response.problem, response.data)
      }
      return response.ok
    }),

    setPreCheckFilters(_queryParams: URLSearchParams) {
      // Placeholder for future filter handling
    },

    fetchPreCheck: flow(function* (id: string) {
      const response = yield self.environment.api.fetchPreCheck(id)
      if (response.ok) {
        self.mergeUpdate(response.data.data, "preChecksMap")
        return response.data.data
      }
      console.error("Failed to fetch PreCheck:", response.problem, response.data)
      return null
    }),

    createPreCheck: flow(function* (data: Partial<IPreCheck>) {
      const response = yield self.environment.api.createPreCheck(data)
      if (response.ok) {
        self.mergeUpdate(response.data.data, "preChecksMap")
        return { ok: true, data: response.data.data }
      }
      console.error("Failed to create PreCheck:", response.problem, response.data)
      return { ok: false, error: response.data?.errors || response.problem }
    }),

    updatePreCheck: flow(function* (id: string, data: Partial<IPreCheck>) {
      const response = yield self.environment.api.updatePreCheck(id, data)
      if (response.ok) {
        self.mergeUpdate(response.data.data, "preChecksMap")
        return { ok: true, data: response.data.data }
      }
      console.error("Failed to update PreCheck:", response.problem, response.data)
      return { ok: false, error: response.data?.errors || response.problem }
    }),
  }))

export interface IPreCheckStore extends Instance<typeof PreCheckStoreModel> {}
