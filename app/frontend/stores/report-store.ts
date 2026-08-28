import { t } from "i18next"
import { flow, Instance, toGenerator, types } from "mobx-state-tree"
import { withEnvironment } from "../lib/with-environment"
import { withRootStore } from "../lib/with-root-store"
import { EFlashMessageStatus } from "../types/enums"
import { IReportPayload, IReportSummary, TReportRangePreset } from "../types/report"
import { startBlobDownload } from "../utils/utility-functions"

const RANGE_STORAGE_KEY = "superAdminReportRange"
const DEFAULT_RANGE: TReportRangePreset = "12_months"
const RANGE_PRESETS: TReportRangePreset[] = ["3_months", "6_months", "12_months", "all_time"]

const storedRange = (): TReportRangePreset => {
  if (typeof sessionStorage === "undefined") return DEFAULT_RANGE
  const value = sessionStorage.getItem(RANGE_STORAGE_KEY)
  return RANGE_PRESETS.includes(value as TReportRangePreset) ? (value as TReportRangePreset) : DEFAULT_RANGE
}

export const ReportStoreModel = types
  .model("ReportStoreModel")
  .props({
    rangePreset: types.optional(types.string, storedRange),
    isLoading: types.optional(types.boolean, false),
    isRefreshing: types.optional(types.boolean, false),
  })
  .volatile(() => ({
    currentPayload: null as IReportPayload | null,
    summaries: [] as IReportSummary[],
  }))
  .extend(withEnvironment())
  .extend(withRootStore())
  .views((self) => ({
    get rangePresets(): TReportRangePreset[] {
      return RANGE_PRESETS
    },
  }))
  .actions((self) => ({
    setRangePreset(preset: TReportRangePreset) {
      self.rangePreset = preset
      if (typeof sessionStorage !== "undefined") {
        sessionStorage.setItem(RANGE_STORAGE_KEY, preset)
      }
    },
    setPayload(payload: IReportPayload | null) {
      self.currentPayload = payload
    },
    setSummaries(summaries: IReportSummary[]) {
      self.summaries = summaries
    },
  }))
  .actions((self) => ({
    fetchSummaries: flow(function* () {
      const response = yield* toGenerator(self.environment.api.fetchReportSummaries())
      if (response.ok && response.data?.data) {
        self.setSummaries(response.data.data)
      }
    }),
    fetchReport: flow(function* (key: string) {
      self.isLoading = true
      self.setPayload(null)
      try {
        const response = yield* toGenerator(self.environment.api.fetchReport(key, self.rangePreset))
        if (response.ok) {
          self.setPayload(response.data?.data ?? null)
        } else {
          self.setPayload(null)
        }
      } finally {
        self.isLoading = false
      }
    }),
    refreshReport: flow(function* (key: string) {
      self.isRefreshing = true
      try {
        const response = yield* toGenerator(self.environment.api.refreshReport(key, self.rangePreset))
        if (response.ok && response.data?.data) {
          self.setPayload(response.data.data)
          if (response.data.data.refreshFailed) {
            self.rootStore.uiStore.flashMessage.show(
              EFlashMessageStatus.error,
              t("reporting.controls.refreshFailedTitle"),
              t("reporting.controls.refreshFailedBody")
            )
          }
        }
      } finally {
        self.isRefreshing = false
      }
    }),
    downloadExport: flow(function* (key: string) {
      const response = yield* toGenerator(self.environment.api.downloadReportExport(key, self.rangePreset))
      if (!response.ok) return
      const fileName = `${key}_${self.rangePreset}_${new Date().toISOString().slice(0, 10)}.csv`
      startBlobDownload(response.data, "text/csv", fileName)
    }),
  }))

export interface IReportStore extends Instance<typeof ReportStoreModel> {}
