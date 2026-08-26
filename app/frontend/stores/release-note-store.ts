import { t } from "i18next"
import { cast, flow, Instance, types } from "mobx-state-tree"
import { createSearchModel } from "../lib/create-search-model"
import { withEnvironment } from "../lib/with-environment"
import { withMerge } from "../lib/with-merge"
import { withRootStore } from "../lib/with-root-store"
import { IReleaseNote, ReleaseNoteModel } from "../models/release-note-model"
import { EReleaseNoteSortFields, EReleaseNoteType } from "../types/enums"
import { TReleaseNoteFormData, TSearchParams } from "../types/types"
import { urlForPath } from "../utils/utility-functions"

const RELEASE_NOTE_ANCHOR_PREFIX = "release-note-"

export const ReleaseNoteStoreModel = types
  .compose(
    types.model("ReleaseNoteStoreModel", {
      releaseNoteMap: types.map(ReleaseNoteModel),
      tableReleaseNotes: types.array(types.reference(ReleaseNoteModel)),
      currentReleaseNote: types.maybeNull(types.reference(ReleaseNoteModel)),
      selectedYear: types.optional(types.number, () => new Date().getFullYear()),
      viewingYearInitialized: types.optional(types.boolean, false),
      applyYearFilterInSearch: types.optional(types.boolean, false),
      publishedOnlyInSearch: types.optional(types.boolean, false),
      selectedReleaseType: types.maybeNull(types.enumeration(Object.values(EReleaseNoteType))),
      availableYears: types.array(types.number),
    }),
    createSearchModel<EReleaseNoteSortFields>("searchReleaseNotes")
  )
  .extend(withEnvironment())
  .extend(withRootStore())
  .extend(withMerge())
  .views((self) => ({
    getSortColumnHeader(field: EReleaseNoteSortFields) {
      return t(`releaseNote.columns.${field}`)
    },
    getReleaseNoteAnchorId(id: string) {
      return `${RELEASE_NOTE_ANCHOR_PREFIX}${id}`
    },
    getReleaseNoteShareUrl(id: string) {
      return urlForPath(`/release-notes#${RELEASE_NOTE_ANCHOR_PREFIX}${id}`)
    },
    parseReleaseNoteIdFromHash(hash: string) {
      const anchorId = hash.replace("#", "")
      if (!anchorId.startsWith(RELEASE_NOTE_ANCHOR_PREFIX)) return null
      return anchorId.slice(RELEASE_NOTE_ANCHOR_PREFIX.length)
    },
    get viewingReleaseNotes(): IReleaseNote[] {
      return self.tableReleaseNotes.filter((note): note is IReleaseNote => !!note)
    },
  }))
  .actions((self) => ({
    setTableReleaseNotes(releaseNotes: IReleaseNote[]) {
      self.tableReleaseNotes = cast(releaseNotes.map((r) => r.id))
    },
    setCurrentReleaseNote(releaseNoteId) {
      self.currentReleaseNote = releaseNoteId
    },
    resetCurrentReleaseNote() {
      self.currentReleaseNote = null
    },
    setSelectedYear(year: number) {
      self.selectedYear = year
    },
    setApplyYearFilterInSearch(apply: boolean) {
      self.applyYearFilterInSearch = apply
    },
    setPublishedOnlyInSearch(apply: boolean) {
      self.publishedOnlyInSearch = apply
    },
    setSelectedReleaseType(releaseType: EReleaseNoteType | null) {
      self.selectedReleaseType = releaseType
    },
    setAvailableYears(years: number[]) {
      self.availableYears = cast(years)
    },
    resetViewingState() {
      self.viewingYearInitialized = false
      self.applyYearFilterInSearch = false
      self.publishedOnlyInSearch = false
      self.selectedReleaseType = null
      self.availableYears = cast([])
    },
  }))
  .actions((self) => ({
    initializeViewingYear: flow(function* () {
      const response = yield self.environment.api.fetchReleaseNoteYears()

      if (response.ok && response.data?.data?.length) {
        const years = response.data.data
        self.setAvailableYears(years)
        self.setSelectedYear(years[0])
      } else {
        self.setAvailableYears([])
      }
    }),

    searchReleaseNotes: flow(function* (opts?: {
      reset?: boolean
      page?: number
      countPerPage?: number
      skipYearFilter?: boolean
    }) {
      if (opts?.reset) {
        self.resetPages()
      }

      const searchParams: TSearchParams<EReleaseNoteSortFields> = {
        query: self.query,
        sort: self.sort,
        page: opts?.page ?? self.currentPage,
        perPage: opts?.countPerPage ?? self.countPerPage,
      }

      if (self.applyYearFilterInSearch && !opts?.skipYearFilter) {
        searchParams.year = self.selectedYear
      }

      if (self.publishedOnlyInSearch) {
        searchParams.publishedOnly = true
      }

      if (self.selectedReleaseType) {
        searchParams.releaseType = self.selectedReleaseType
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
  .actions((self) => ({
    selectViewingYear: flow(function* (year: number) {
      self.setSelectedYear(year)
      yield self.searchReleaseNotes({ reset: true, page: 1 })
    }),

    // useSearch depends on selectedReleaseType — only reset page here, let it fetch
    selectReleaseTypeFilter(releaseType: EReleaseNoteType | null) {
      self.setSelectedReleaseType(releaseType)
      self.resetPages()
    },

    ensureReleaseNoteVisibleInList: flow(function* (releaseNoteId: string) {
      const contextResponse = yield self.environment.api.fetchReleaseNoteViewerContext(releaseNoteId, {
        perPage: self.countPerPage,
      })

      if (!contextResponse.ok || !contextResponse.data?.data) {
        return false
      }

      const { year, page } = contextResponse.data.data

      if (year !== self.selectedYear) {
        self.setSelectedYear(year)
      }

      self.setCurrentPage(page)

      return true
    }),
  }))
  .actions((self) => ({
    initializeViewingPage: flow(function* (hash = "") {
      self.resetViewingState()
      self.syncWithUrl()
      self.setApplyYearFilterInSearch(true)
      self.setPublishedOnlyInSearch(true)
      yield self.initializeViewingYear()

      const releaseNoteId = self.parseReleaseNoteIdFromHash(hash)
      if (releaseNoteId) {
        const ensured = yield self.ensureReleaseNoteVisibleInList(releaseNoteId)
        if (ensured) {
          yield self.searchReleaseNotes({
            page: self.currentPage,
            countPerPage: self.countPerPage,
          })
        }
      }

      self.viewingYearInitialized = true
    }),
  }))

export interface IReleaseNoteStore extends Instance<typeof ReleaseNoteStoreModel> {}
