import { t } from "i18next"
import { cast, flow, Instance, types } from "mobx-state-tree"
import { createSearchModel } from "../lib/create-search-model"
import { withEnvironment } from "../lib/with-environment"
import { withMerge } from "../lib/with-merge"
import { withRootStore } from "../lib/with-root-store"
import { IReleaseNote, ReleaseNoteModel } from "../models/release-note-model"
import { EReleaseNoteSortFields } from "../types/enums"
import { TReleaseNoteFormData, TSearchParams } from "../types/types"

export const ReleaseNoteStoreModel = types
  .compose(
    types.model("ReleaseNoteStoreModel", {
      releaseNoteMap: types.map(ReleaseNoteModel),
      tableReleaseNotes: types.array(types.reference(ReleaseNoteModel)),
    }),
    createSearchModel<EReleaseNoteSortFields>("searchReleaseNotes")
  )
  .extend(withEnvironment())
  .extend(withRootStore())
  .extend(withMerge())
  .views(() => ({
    getSortColumnHeader(field: EReleaseNoteSortFields) {
      return t(`releaseNote.columns.${field}`)
    },
  }))
  .actions((self) => ({
    setTableReleaseNotes(releaseNotes: IReleaseNote[]) {
      self.tableReleaseNotes = cast(releaseNotes.map((r) => r.id))
    },
  }))
  .actions((self) => ({
    searchReleaseNotes: flow(function* (opts?: { reset?: boolean; page?: number; countPerPage?: number }) {
      if (opts?.reset) {
        self.resetPages()
      }

      const searchParams: TSearchParams<EReleaseNoteSortFields> = {
        query: self.query,
        sort: self.sort,
        page: opts?.page ?? self.currentPage,
        perPage: opts?.countPerPage ?? self.countPerPage,
      }

      const response = yield self.environment.api.fetchReleaseNotes(searchParams)

      if (response.ok && response.data) {
        self.mergeUpdateAll(response.data.data, "releaseNoteMap")
        self.setTableReleaseNotes(response.data.data)
        self.setPageFields(response.data.meta, opts)
      } else {
        console.error("Failed to search release notes:", response)
      }
      return response.ok
    }),

    fetchReleaseNote: flow(function* (id: string) {
      const response = yield self.environment.api.fetchReleaseNote(id)
      if (response.ok && response.data?.data) {
        self.mergeUpdate(response.data.data, "releaseNoteMap")
        return response.data.data
      }
      console.error("Failed to fetch release note:", response.problem, response.data)
      return null
    }),

    createReleaseNote: flow(function* (data: TReleaseNoteFormData) {
      const response = yield self.environment.api.createReleaseNote(data)
      if (response.ok && response.data?.data) {
        self.mergeUpdate(response.data.data, "releaseNoteMap")
        return { ok: true as const, data: response.data.data }
      }
      console.error("Failed to create release note:", response.problem, response.data)
      return { ok: false as const, error: response.data?.errors || response.problem }
    }),

    updateReleaseNote: flow(function* (id: string, data: TReleaseNoteFormData) {
      const response = yield self.environment.api.updateReleaseNote(id, data)
      if (response.ok && response.data?.data) {
        self.mergeUpdate(response.data.data, "releaseNoteMap")
        return { ok: true as const, data: response.data.data }
      }
      console.error("Failed to update release note:", response.problem, response.data)
      return { ok: false as const, error: response.data?.errors || response.problem }
    }),

    publishReleaseNote: flow(function* (id: string, data: TReleaseNoteFormData) {
      const response = yield self.environment.api.publishReleaseNote(id, data)
      if (response.ok && response.data?.data) {
        self.mergeUpdate(response.data.data, "releaseNoteMap")
        return { ok: true as const, data: response.data.data }
      }
      console.error("Failed to publish release note:", response.problem, response.data)
      return { ok: false as const, error: response.data?.errors || response.problem }
    }),
  }))

export interface IReleaseNoteStore extends Instance<typeof ReleaseNoteStoreModel> {}
