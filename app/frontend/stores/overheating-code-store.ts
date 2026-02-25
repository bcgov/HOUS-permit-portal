import { t } from "i18next"
import { Instance, flow, types } from "mobx-state-tree"
import * as R from "ramda"
import { createSearchModel } from "../lib/create-search-model"
import { withEnvironment } from "../lib/with-environment"
import { withMerge } from "../lib/with-merge"
import { withRootStore } from "../lib/with-root-store"
import { IOverheatingCode, OverheatingCodeModel } from "../models/overheating-code"
import { EOverheatingCodeSortFields } from "../types/enums"
import { TSearchParams } from "../types/types"

export const OverheatingCodeStoreModel = types
  .compose(
    types.model("OverheatingCodeStore", {
      overheatingCodesMap: types.map(OverheatingCodeModel),
      tableOverheatingCodes: types.optional(types.array(types.reference(OverheatingCodeModel)), []),
    }),
    createSearchModel<EOverheatingCodeSortFields>("searchOverheatingCodes", "setOverheatingCodeFilters")
  )
  .extend(withEnvironment())
  .extend(withRootStore())
  .extend(withMerge())
  .views((self) => ({
    getSortColumnHeader(field: EOverheatingCodeSortFields) {
      // @ts-ignore
      return t(`overheatingCode.columns.${field}`)
    },
  }))
  .actions((self) => ({
    __beforeMergeUpdate(overheatingCode: any) {
      if (overheatingCode.jurisdiction) {
        self.rootStore.jurisdictionStore.mergeUpdate(overheatingCode.jurisdiction, "jurisdictionMap")
      }

      const parseDecimal = (val: any) => (val != null ? Number(val) : null)

      return R.mergeRight(overheatingCode, {
        jurisdiction: overheatingCode.jurisdiction?.id,
        minimumCoolingCapacity: parseDecimal(overheatingCode.minimumCoolingCapacity),
        designOutdoorTemp: parseDecimal(overheatingCode.designOutdoorTemp),
        designIndoorTemp: parseDecimal(overheatingCode.designIndoorTemp),
        designAdjacentTemp: parseDecimal(overheatingCode.designAdjacentTemp),
        coolingZoneArea: parseDecimal(overheatingCode.coolingZoneArea),
        ventilationRate: parseDecimal(overheatingCode.ventilationRate),
        atrePercentage: parseDecimal(overheatingCode.atrePercentage),
      })
    },

    setTableOverheatingCodes(overheatingCodes: IOverheatingCode[]) {
      // @ts-ignore
      self.tableOverheatingCodes.replace(overheatingCodes.map((s) => s.id))
    },
  }))
  .actions((self) => ({
    searchOverheatingCodes: flow(function* (opts?: { reset?: boolean; page?: number; countPerPage?: number }) {
      if (opts?.reset) {
        self.resetPages()
      }

      const params: TSearchParams<EOverheatingCodeSortFields> = {
        query: self.query,
        sort: self.sort,
        page: opts?.page ?? self.currentPage,
        perPage: opts?.countPerPage ?? self.countPerPage,
      }

      const response = yield self.environment.api.fetchOverheatingCodes(params)
      if (response.ok) {
        self.mergeUpdateAll(response.data.data, "overheatingCodesMap")
        self.setTableOverheatingCodes(response.data.data as any)
        self.setPageFields(response.data.meta, opts)
      } else {
        console.error("Failed to search OverheatingCodes:", response.problem, response.data)
      }
      return response.ok
    }),

    setOverheatingCodeFilters(_queryParams: URLSearchParams) {},

    fetchOverheatingCode: flow(function* (id: string) {
      const response = yield self.environment.api.fetchOverheatingCode(id)
      if (response.ok) {
        self.mergeUpdate(response.data.data, "overheatingCodesMap")
        return response.data.data
      }
      console.error("Failed to fetch OverheatingCode:", response.problem, response.data)
      return null
    }),

    createOverheatingCode: flow(function* (data: Partial<IOverheatingCode>) {
      const response = yield self.environment.api.createOverheatingCode(data)
      if (response.ok) {
        self.mergeUpdate(response.data.data, "overheatingCodesMap")
        return { ok: true, data: response.data.data }
      }
      console.error("Failed to create OverheatingCode:", response.problem, response.data)
      return { ok: false, error: response.data?.errors || response.problem }
    }),

    updateOverheatingCode: flow(function* (id: string, data: Record<string, any>) {
      const response = yield self.environment.api.updateOverheatingCode(id, data)
      if (response.ok) {
        self.mergeUpdate(response.data.data, "overheatingCodesMap")
        return { ok: true, data: response.data.data }
      }
      console.error("Failed to update OverheatingCode:", response.problem, response.data)
      return { ok: false, error: response.data?.errors || response.problem }
    }),
  }))

export interface IOverheatingCodeStore extends Instance<typeof OverheatingCodeStoreModel> {}
