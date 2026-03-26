import * as humps from "humps"
import { t } from "i18next"
import { cast, flow, Instance, types } from "mobx-state-tree"
import { createSearchModel } from "../lib/create-search-model"
import { withEnvironment } from "../lib/with-environment"
import { withRootStore } from "../lib/with-root-store"
import { PermitApplicationModel } from "../models/permit-application"
import { PermitProjectModel } from "../models/permit-project"
import {
  EInboxDisplayMode,
  EInboxViewMode,
  EPermitApplicationInboxSortFields,
  EPermitApplicationStatus,
  EPermitProjectInboxSortFields,
  EProjectState,
  ERadioFilterValue,
} from "../types/enums"
import { IPermitApplicationInboxSearchFilters, IPermitProjectInboxSearchFilters, TSearchParams } from "../types/types"
import { pushQueryParams, setQueryParam } from "../utils/utility-functions"

const KANBAN_PER_COLUMN = 10

function decamelizeHashKeys(hash: Record<string, number>): Record<string, number> {
  const result: Record<string, number> = {}
  for (const [key, value] of Object.entries(hash)) {
    result[humps.decamelize(key)] = value
  }
  return result
}

// ---------------------------------------------------------------------------
// Sub-store: Permit Project Inbox Search
// ---------------------------------------------------------------------------

export const PermitProjectInboxStoreModel = types
  .compose(
    types.model("PermitProjectInboxStore", {
      tablePermitProjects: types.array(types.reference(PermitProjectModel)),
      stateCounts: types.optional(types.frozen<Record<string, number>>(), {}),
      columnTotals: types.optional(types.frozen<Record<string, number>>(), {}),
      requirementTemplateIdFilter: types.optional(types.array(types.string), []),
      statusFilter: types.optional(types.array(types.string), []),
      unreadFilter: types.optional(types.enumeration(Object.values(ERadioFilterValue)), ERadioFilterValue.include),
      // ### SUBMISSION INDEX STUB FEATURE
      meetingRequestFilter: types.optional(
        types.enumeration(Object.values(ERadioFilterValue)),
        ERadioFilterValue.include
      ),
      daysInQueueFilter: types.maybeNull(types.frozen<{ operator: string; days: number }>()),
      // ### SUBMISSION INDEX STUB FEATURE
      assignedFilter: types.optional(types.array(types.string), []),
    }),
    createSearchModel<EPermitProjectInboxSortFields>(
      "searchJurisdictionPermitProjects",
      "setJurisdictionPermitProjectFilters"
    )
  )
  .extend(withEnvironment())
  .extend(withRootStore())
  .views((self) => ({
    getSortColumnHeader(field: EPermitProjectInboxSortFields) {
      // @ts-ignore
      return t(`submissionInbox.projectColumns.${field}`)
    },
  }))
  .actions((self) => ({
    setTablePermitProjects(projects) {
      self.tablePermitProjects = cast(projects.map((p) => p.id))
    },
    setStateCounts(counts: Record<string, number>) {
      self.stateCounts = decamelizeHashKeys(counts)
    },
    setColumnTotals(counts: Record<string, number>) {
      self.columnTotals = decamelizeHashKeys(counts)
    },
    setRequirementTemplateIdFilter(value: string[]) {
      self.requirementTemplateIdFilter = cast(value)
      setQueryParam("requirementTemplateIds", value)
    },
    setStatusFilter(value: string[]) {
      self.statusFilter = cast(value)
      setQueryParam("status", value)
    },
    setUnreadFilter(value: ERadioFilterValue) {
      self.unreadFilter = value
      setQueryParam("unread", value === ERadioFilterValue.include ? "" : value)
    },
    // ### SUBMISSION INDEX STUB FEATURE
    setMeetingRequestFilter(value: ERadioFilterValue) {
      self.meetingRequestFilter = value
    },
    setDaysInQueueFilter(value: { operator: string; days: number } | null) {
      self.daysInQueueFilter = value
      setQueryParam("daysInQueueOp", value?.operator ?? "")
      setQueryParam("daysInQueueDays", value ? value.days.toString() : "")
    },
    // ### SUBMISSION INDEX STUB FEATURE
    setAssignedFilter(value: string[]) {
      self.assignedFilter = cast(value)
    },
    adjustCountsForTransition(oldState: string, newState: string) {
      const sc = { ...self.stateCounts }
      if (sc[oldState] != null) sc[oldState] = Math.max(0, sc[oldState] - 1)
      sc[newState] = (sc[newState] ?? 0) + 1
      self.stateCounts = sc

      const ct = { ...self.columnTotals }
      if (ct[oldState] != null) ct[oldState] = Math.max(0, ct[oldState] - 1)
      ct[newState] = (ct[newState] ?? 0) + 1
      self.columnTotals = ct
    },
  }))
  .actions((self) => ({
    searchJurisdictionPermitProjects: flow(function* (opts?: {
      reset?: boolean
      page?: number
      countPerPage?: number
    }) {
      if (opts?.reset) {
        self.resetPages()
      }

      const isKanban = self.rootStore?.submissionInboxStore?.displayMode === EInboxDisplayMode.columns

      const searchParams: TSearchParams<EPermitProjectInboxSortFields, IPermitProjectInboxSearchFilters> = {
        query: self.query,
        sort: self.sort,
        page: isKanban ? undefined : (opts?.page ?? self.currentPage),
        perPage: isKanban ? undefined : (opts?.countPerPage ?? self.countPerPage),
        mode: isKanban ? "kanban" : "list",
        perColumn: isKanban ? KANBAN_PER_COLUMN : undefined,
        filters: {
          requirementTemplateIds:
            self.requirementTemplateIdFilter.length > 0 ? [...self.requirementTemplateIdFilter] : undefined,
          status: self.statusFilter.length > 0 ? [...self.statusFilter] : undefined,
          unread: self.unreadFilter !== ERadioFilterValue.include ? self.unreadFilter : undefined,
          // ### SUBMISSION INDEX STUB FEATURE
          meetingRequest:
            self.meetingRequestFilter !== ERadioFilterValue.include ? self.meetingRequestFilter : undefined,
          daysInQueue: self.daysInQueueFilter ?? undefined,
          // ### SUBMISSION INDEX STUB FEATURE
          assigned: self.assignedFilter.length > 0 ? [...self.assignedFilter] : undefined,
        },
      }

      const currentJurisdictionId = self.rootStore?.jurisdictionStore?.currentJurisdiction?.id
      if (!currentJurisdictionId) return false

      const response = yield self.environment.api.fetchJurisdictionPermitProjects(currentJurisdictionId, searchParams)

      if (response.ok && response.data) {
        self.rootStore.permitProjectStore.mergeUpdateAll(response.data.data, "permitProjectMap")
        self.setTablePermitProjects(response.data.data)
        self.setPageFields(response.data.meta, opts)
        if (response.data.meta?.stateCounts) {
          self.setStateCounts(response.data.meta.stateCounts)
        }
        if (response.data.meta?.columnTotals) {
          self.setColumnTotals(response.data.meta.columnTotals)
        }
      }
      return response.ok
    }),
    setJurisdictionPermitProjectFilters(queryParams: URLSearchParams) {
      const requirementTemplateIds = queryParams.get("requirementTemplateIds")?.split(",")
      const status = queryParams.get("status")?.split(",")
      const unread = queryParams.get("unread") as ERadioFilterValue
      const daysInQueueOp = queryParams.get("daysInQueueOp")
      const daysInQueueDays = queryParams.get("daysInQueueDays")
      if (requirementTemplateIds) self.setRequirementTemplateIdFilter(requirementTemplateIds)
      if (status) self.setStatusFilter(status)
      if (unread) self.setUnreadFilter(unread)
      if (daysInQueueOp && daysInQueueDays) {
        self.setDaysInQueueFilter({ operator: daysInQueueOp, days: parseInt(daysInQueueDays) })
      }
    },
  }))
  .actions((self) => ({
    resetFilters() {
      self.setRequirementTemplateIdFilter([])
      self.setStatusFilter([])
      self.setUnreadFilter(ERadioFilterValue.include)
      self.setMeetingRequestFilter(ERadioFilterValue.include)
      self.setDaysInQueueFilter(null)
      self.setAssignedFilter([])
      self.searchJurisdictionPermitProjects({ reset: true })
    },
    reorderProjects: flow(function* (orderedIds: string[]) {
      orderedIds.forEach((id, idx) => {
        const project = self.rootStore.permitProjectStore.permitProjectMap.get(id)
        if (project) project.setInboxSortOrder(idx)
      })

      const items = orderedIds.map((id, idx) => ({ id, inboxSortOrder: idx }))
      yield self.environment.api.reorderPermitProjects(items)
    }),
  }))

// ---------------------------------------------------------------------------
// Sub-store: Permit Application Inbox Search
// ---------------------------------------------------------------------------

export const PermitApplicationInboxStoreModel = types
  .compose(
    types.model("PermitApplicationInboxStore", {
      tablePermitApplications: types.array(types.reference(PermitApplicationModel)),
      stateCounts: types.optional(types.frozen<Record<string, number>>(), {}),
      columnTotals: types.optional(types.frozen<Record<string, number>>(), {}),
      requirementTemplateIdFilter: types.optional(types.array(types.string), []),
      statusFilter: types.optional(types.array(types.enumeration(Object.values(EPermitApplicationStatus))), []),
      unreadFilter: types.optional(types.enumeration(Object.values(ERadioFilterValue)), ERadioFilterValue.include),
      // ### SUBMISSION INDEX STUB FEATURE
      meetingRequestFilter: types.optional(
        types.enumeration(Object.values(ERadioFilterValue)),
        ERadioFilterValue.include
      ),
      daysInQueueFilter: types.maybeNull(types.frozen<{ operator: string; days: number }>()),
      // ### SUBMISSION INDEX STUB FEATURE
      assignedFilter: types.optional(types.array(types.string), []),
    }),
    createSearchModel<EPermitApplicationInboxSortFields>(
      "searchJurisdictionPermitApplications",
      "setJurisdictionPermitApplicationFilters"
    )
  )
  .extend(withEnvironment())
  .extend(withRootStore())
  .views((self) => ({
    getSortColumnHeader(field: EPermitApplicationInboxSortFields) {
      // @ts-ignore
      return t(`submissionInbox.applicationColumns.${field}`)
    },
  }))
  .actions((self) => ({
    setTablePermitApplications(permitApplications) {
      self.tablePermitApplications = cast(permitApplications.map((pa) => pa.id))
    },
    setStateCounts(counts: Record<string, number>) {
      self.stateCounts = decamelizeHashKeys(counts)
    },
    setColumnTotals(counts: Record<string, number>) {
      self.columnTotals = decamelizeHashKeys(counts)
    },
    setRequirementTemplateIdFilter(value: string[]) {
      self.requirementTemplateIdFilter = cast(value)
      setQueryParam("requirementTemplateIds", value)
    },
    setStatusFilter(value: EPermitApplicationStatus[]) {
      // @ts-ignore
      self.statusFilter = cast(value)
      setQueryParam("status", value as string[])
    },
    setUnreadFilter(value: ERadioFilterValue) {
      self.unreadFilter = value
      setQueryParam("unread", value === ERadioFilterValue.include ? "" : value)
    },
    // ### SUBMISSION INDEX STUB FEATURE
    setMeetingRequestFilter(value: ERadioFilterValue) {
      self.meetingRequestFilter = value
    },
    setDaysInQueueFilter(value: { operator: string; days: number } | null) {
      self.daysInQueueFilter = value
      setQueryParam("daysInQueueOp", value?.operator ?? "")
      setQueryParam("daysInQueueDays", value ? value.days.toString() : "")
    },
    // ### SUBMISSION INDEX STUB FEATURE
    setAssignedFilter(value: string[]) {
      self.assignedFilter = cast(value)
    },
    adjustCountsForTransition(oldStatus: string, newStatus: string) {
      const sc = { ...self.stateCounts }
      if (sc[oldStatus] != null) sc[oldStatus] = Math.max(0, sc[oldStatus] - 1)
      sc[newStatus] = (sc[newStatus] ?? 0) + 1
      self.stateCounts = sc

      const ct = { ...self.columnTotals }
      if (ct[oldStatus] != null) ct[oldStatus] = Math.max(0, ct[oldStatus] - 1)
      ct[newStatus] = (ct[newStatus] ?? 0) + 1
      self.columnTotals = ct
    },
  }))
  .actions((self) => ({
    searchJurisdictionPermitApplications: flow(function* (opts?: {
      reset?: boolean
      page?: number
      countPerPage?: number
    }) {
      if (opts?.reset) {
        self.resetPages()
      }

      const isKanban = self.rootStore?.submissionInboxStore?.displayMode === EInboxDisplayMode.columns

      const searchParams: TSearchParams<EPermitApplicationInboxSortFields, IPermitApplicationInboxSearchFilters> = {
        query: self.query,
        sort: self.sort,
        page: isKanban ? undefined : (opts?.page ?? self.currentPage),
        perPage: isKanban ? undefined : (opts?.countPerPage ?? self.countPerPage),
        mode: isKanban ? "kanban" : "list",
        perColumn: isKanban ? KANBAN_PER_COLUMN : undefined,
        filters: {
          requirementTemplateIds:
            self.requirementTemplateIdFilter.length > 0 ? [...self.requirementTemplateIdFilter] : undefined,
          status: self.statusFilter.length > 0 ? [...self.statusFilter] : undefined,
          unread: self.unreadFilter !== ERadioFilterValue.include ? self.unreadFilter : undefined,
          // ### SUBMISSION INDEX STUB FEATURE
          meetingRequest:
            self.meetingRequestFilter !== ERadioFilterValue.include ? self.meetingRequestFilter : undefined,
          daysInQueue: self.daysInQueueFilter ?? undefined,
          // ### SUBMISSION INDEX STUB FEATURE
          assigned: self.assignedFilter.length > 0 ? [...self.assignedFilter] : undefined,
        },
      }

      const currentJurisdictionId = self.rootStore?.jurisdictionStore?.currentJurisdiction?.id
      if (!currentJurisdictionId) return false

      const response = yield self.environment.api.fetchJurisdictionPermitApplications(
        currentJurisdictionId,
        searchParams
      )

      if (response.ok) {
        self.rootStore.permitApplicationStore.mergeUpdateAll(response.data.data, "permitApplicationMap")
        self.setTablePermitApplications(response.data.data)
        self.setPageFields(response.data.meta, opts)
        if (response.data.meta?.statusCounts) {
          self.setStateCounts(response.data.meta.statusCounts)
        }
        if (response.data.meta?.columnTotals) {
          self.setColumnTotals(response.data.meta.columnTotals)
        }
      }
      return response.ok
    }),
    setJurisdictionPermitApplicationFilters(queryParams: URLSearchParams) {
      const requirementTemplateIds = queryParams.get("requirementTemplateIds")?.split(",")
      const statusRaw = queryParams.get("status")?.split(",") as EPermitApplicationStatus[]
      const unread = queryParams.get("unread") as ERadioFilterValue
      const daysInQueueOp = queryParams.get("daysInQueueOp")
      const daysInQueueDays = queryParams.get("daysInQueueDays")
      if (requirementTemplateIds) self.setRequirementTemplateIdFilter(requirementTemplateIds)
      if (statusRaw) self.setStatusFilter(statusRaw)
      if (unread) self.setUnreadFilter(unread)
      if (daysInQueueOp && daysInQueueDays) {
        self.setDaysInQueueFilter({ operator: daysInQueueOp, days: parseInt(daysInQueueDays) })
      }
    },
  }))
  .actions((self) => ({
    resetFilters() {
      self.setRequirementTemplateIdFilter([])
      self.setStatusFilter([] as any)
      self.setUnreadFilter(ERadioFilterValue.include)
      self.setMeetingRequestFilter(ERadioFilterValue.include)
      self.setDaysInQueueFilter(null)
      self.setAssignedFilter([])
      self.searchJurisdictionPermitApplications({ reset: true })
    },
    reorderApplications: flow(function* (orderedIds: string[]) {
      orderedIds.forEach((id, idx) => {
        const application = self.rootStore.permitApplicationStore.permitApplicationMap.get(id)
        if (application) application.setInboxSortOrder(idx)
      })

      const items = orderedIds.map((id, idx) => ({ id, inboxSortOrder: idx }))
      yield self.environment.api.reorderPermitApplications(items)
    }),
  }))

// ---------------------------------------------------------------------------
// Parent store: Submission Inbox
// ---------------------------------------------------------------------------

export const SubmissionInboxStoreModel = types
  .model("SubmissionInboxStore", {
    viewMode: types.optional(types.enumeration(Object.values(EInboxViewMode)), EInboxViewMode.projects),
    displayMode: types.optional(types.enumeration(Object.values(EInboxDisplayMode)), EInboxDisplayMode.list),
    collapsedColumns: types.optional(types.array(types.string), [EProjectState.complete, EProjectState.closed]),
    permitProjectSearch: types.optional(PermitProjectInboxStoreModel, {}),
    permitApplicationSearch: types.optional(PermitApplicationInboxStoreModel, {}),
  })
  .actions((self) => ({
    setViewMode(mode: EInboxViewMode) {
      self.viewMode = mode
      pushQueryParams({ viewMode: mode, displayMode: self.displayMode })
    },
    setDisplayMode(mode: EInboxDisplayMode) {
      self.displayMode = mode
      pushQueryParams({ viewMode: self.viewMode, displayMode: mode })
    },
    restoreModesFromUrl() {
      const params = new URLSearchParams(window.location.search)
      const urlView = params.get("viewMode") as EInboxViewMode | null
      const urlDisplay = params.get("displayMode") as EInboxDisplayMode | null
      if (urlView && Object.values(EInboxViewMode).includes(urlView)) {
        self.viewMode = urlView
      }
      if (urlDisplay && Object.values(EInboxDisplayMode).includes(urlDisplay)) {
        self.displayMode = urlDisplay
      }
    },
    toggleColumnCollapsed(columnState: string) {
      const idx = self.collapsedColumns.indexOf(columnState)
      if (idx >= 0) {
        self.collapsedColumns.splice(idx, 1)
      } else {
        self.collapsedColumns.push(columnState)
      }
    },
  }))

export interface ISubmissionInboxStore extends Instance<typeof SubmissionInboxStoreModel> {}
export interface IPermitProjectInboxStore extends Instance<typeof PermitProjectInboxStoreModel> {}
export interface IPermitApplicationInboxStore extends Instance<typeof PermitApplicationInboxStoreModel> {}
