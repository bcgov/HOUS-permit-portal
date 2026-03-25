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
  ERadioFilterValue,
} from "../types/enums"
import { IPermitApplicationInboxSearchFilters, IPermitProjectInboxSearchFilters, TSearchParams } from "../types/types"
import { setQueryParam } from "../utils/utility-functions"

// ---------------------------------------------------------------------------
// Sub-store: Permit Project Inbox Search
// ---------------------------------------------------------------------------

export const PermitProjectInboxStoreModel = types
  .compose(
    types.model("PermitProjectInboxStore", {
      tablePermitProjects: types.array(types.reference(PermitProjectModel)),
      stateCounts: types.optional(types.frozen<Record<string, number>>(), {}),
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
      self.stateCounts = counts
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

      const searchParams: TSearchParams<EPermitProjectInboxSortFields, IPermitProjectInboxSearchFilters> = {
        query: self.query,
        sort: self.sort,
        page: opts?.page ?? self.currentPage,
        perPage: opts?.countPerPage ?? self.countPerPage,
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
      self.requirementTemplateIdFilter = cast([])
      self.statusFilter = cast([])
      self.unreadFilter = ERadioFilterValue.include
      self.meetingRequestFilter = ERadioFilterValue.include
      self.daysInQueueFilter = null
      self.assignedFilter = cast([])
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

      const searchParams: TSearchParams<EPermitApplicationInboxSortFields, IPermitApplicationInboxSearchFilters> = {
        query: self.query,
        sort: self.sort,
        page: opts?.page ?? self.currentPage,
        perPage: opts?.countPerPage ?? self.countPerPage,
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
      self.requirementTemplateIdFilter = cast([])
      self.statusFilter = cast([])
      self.unreadFilter = ERadioFilterValue.include
      self.meetingRequestFilter = ERadioFilterValue.include
      self.daysInQueueFilter = null
      self.assignedFilter = cast([])
      self.searchJurisdictionPermitApplications({ reset: true })
    },
  }))

// ---------------------------------------------------------------------------
// Parent store: Submission Inbox
// ---------------------------------------------------------------------------

export const SubmissionInboxStoreModel = types
  .model("SubmissionInboxStore", {
    viewMode: types.optional(types.enumeration(Object.values(EInboxViewMode)), EInboxViewMode.projects),
    displayMode: types.optional(types.enumeration(Object.values(EInboxDisplayMode)), EInboxDisplayMode.list),
    collapsedColumns: types.optional(types.array(types.string), []),
    permitProjectSearch: types.optional(PermitProjectInboxStoreModel, {}),
    permitApplicationSearch: types.optional(PermitApplicationInboxStoreModel, {}),
  })
  .actions((self) => ({
    setViewMode(mode: EInboxViewMode) {
      self.viewMode = mode
    },
    setDisplayMode(mode: EInboxDisplayMode) {
      self.displayMode = mode
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
