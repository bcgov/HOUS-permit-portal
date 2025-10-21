import { t } from "i18next"
import { Instance, flow, types } from "mobx-state-tree"
import * as R from "ramda"
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
      unviewedCount: types.optional(types.number, 0),
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
    __beforeMergeUpdate(preCheck: any) {
      // Normalize jurisdiction data into jurisdictionStore
      if (preCheck.jurisdiction) {
        self.rootStore.jurisdictionStore.mergeUpdate(preCheck.jurisdiction, "jurisdictionMap")
      }
      // Normalize permit_type data into permitTypeStore
      if (preCheck.permitType) {
        self.rootStore.permitClassificationStore.mergeUpdate(preCheck.permitType, "permitTypeMap")
      }
      return R.mergeRight(preCheck, {
        jurisdiction: preCheck.jurisdiction?.id,
        permitType: preCheck.permitType?.id,
      })
    },

    setTablePreChecks(preChecks: IPreCheck[]) {
      // @ts-ignore
      self.tablePreChecks.replace(preChecks.map((s) => s.id))
    },

    setUnviewedCount(count: number) {
      self.unviewedCount = count
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
        self.setUnviewedCount(response.data.meta?.unviewedCount || 0)
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

    updatePreCheck: flow(function* (id: string, data: Record<string, any>) {
      const response = yield self.environment.api.updatePreCheck(id, data)
      if (response.ok) {
        self.mergeUpdate(response.data.data, "preChecksMap")
        return { ok: true, data: response.data.data }
      }
      console.error("Failed to update PreCheck:", response.problem, response.data)
      return { ok: false, error: response.data?.errors || response.problem }
    }),

    submitPreCheck: flow(function* (id: string) {
      const response = yield self.environment.api.submitPreCheck(id)
      if (response.ok) {
        self.mergeUpdate(response.data.data, "preChecksMap")
        return { ok: true, data: response.data.data }
      }
      console.error("Failed to submit PreCheck:", response.problem, response.data)
      return { ok: false, error: response.data?.errors || response.problem }
    }),

    markPreCheckAsViewed: flow(function* (id: string) {
      const response = yield self.environment.api.markPreCheckAsViewed(id)
      if (response.ok) {
        self.mergeUpdate(response.data.data, "preChecksMap")
        // Decrement unviewed count
        if (self.unviewedCount > 0) {
          self.setUnviewedCount(self.unviewedCount - 1)
        }
        return { ok: true }
      }
      console.error("Failed to mark PreCheck as viewed:", response.problem, response.data)
      return { ok: false, error: response.data?.errors || response.problem }
    }),
  }))

export interface IPreCheckStore extends Instance<typeof PreCheckStoreModel> {}
