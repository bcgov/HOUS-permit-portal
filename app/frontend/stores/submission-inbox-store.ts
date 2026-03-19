import { t } from "i18next"
import { cast, flow, Instance, types } from "mobx-state-tree"
import { createSearchModel } from "../lib/create-search-model"
import { withEnvironment } from "../lib/with-environment"
import { withRootStore } from "../lib/with-root-store"
import { PermitApplicationModel } from "../models/permit-application"
import { PermitProjectModel } from "../models/permit-project"
import {
  EPermitApplicationInboxSortFields,
  EPermitApplicationStatus,
  EPermitProjectInboxSortFields,
  ERadioFilterValue,
} from "../types/enums"
import { IPermitApplicationInboxSearchFilters, IPermitProjectInboxSearchFilters, TSearchParams } from "../types/types"

// ---------------------------------------------------------------------------
// Sub-store: Permit Project Inbox Search
// ---------------------------------------------------------------------------

export const PermitProjectInboxStoreModel = types
  .compose(
    types.model("PermitProjectInboxStore", {
      tablePermitProjects: types.array(types.reference(PermitProjectModel)),
      permitTypeFilter: types.optional(types.array(types.string), []),
      statusFilter: types.optional(types.array(types.string), []),
      unreadFilter: types.optional(types.enumeration(Object.values(ERadioFilterValue)), ERadioFilterValue.include),
      // ### SUBMISSION INDEX STUB FEATURE
      meetingRequestFilter: types.optional(
        types.enumeration(Object.values(ERadioFilterValue)),
        ERadioFilterValue.include
      ),
      // ### SUBMISSION INDEX STUB FEATURE
      daysInQueueFilter: types.optional(types.array(types.string), []),
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
    setPermitTypeFilter(value: string[]) {
      self.permitTypeFilter = cast(value)
    },
    setStatusFilter(value: string[]) {
      self.statusFilter = cast(value)
    },
    setUnreadFilter(value: ERadioFilterValue) {
      self.unreadFilter = value
    },
    // ### SUBMISSION INDEX STUB FEATURE
    setMeetingRequestFilter(value: ERadioFilterValue) {
      self.meetingRequestFilter = value
    },
    // ### SUBMISSION INDEX STUB FEATURE
    setDaysInQueueFilter(value: string[]) {
      self.daysInQueueFilter = cast(value)
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
          permitType: self.permitTypeFilter.length > 0 ? [...self.permitTypeFilter] : undefined,
          status: self.statusFilter.length > 0 ? [...self.statusFilter] : undefined,
          unread: self.unreadFilter !== ERadioFilterValue.include ? self.unreadFilter : undefined,
          // ### SUBMISSION INDEX STUB FEATURE
          meetingRequest:
            self.meetingRequestFilter !== ERadioFilterValue.include ? self.meetingRequestFilter : undefined,
          // ### SUBMISSION INDEX STUB FEATURE
          daysInQueue: self.daysInQueueFilter.length > 0 ? [...self.daysInQueueFilter] : undefined,
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
      }
      return response.ok
    }),
    setJurisdictionPermitProjectFilters(queryParams: URLSearchParams) {
      const permitType = queryParams.get("permitType")?.split(",")
      const status = queryParams.get("status")?.split(",")
      const unread = queryParams.get("unread") as ERadioFilterValue
      if (permitType) self.setPermitTypeFilter(permitType)
      if (status) self.setStatusFilter(status)
      if (unread) self.setUnreadFilter(unread)
    },
  }))
  .actions((self) => ({
    resetFilters() {
      self.permitTypeFilter = cast([])
      self.statusFilter = cast([])
      self.unreadFilter = ERadioFilterValue.include
      self.meetingRequestFilter = ERadioFilterValue.include
      self.daysInQueueFilter = cast([])
      self.assignedFilter = cast([])
      self.searchJurisdictionPermitProjects({ reset: true })
    },
  }))

// ---------------------------------------------------------------------------
// Sub-store: Permit Application Inbox Search
// ---------------------------------------------------------------------------

export const PermitApplicationInboxStoreModel = types
  .compose(
    types.model("PermitApplicationInboxStore", {
      tablePermitApplications: types.array(types.reference(PermitApplicationModel)),
      permitTypeFilter: types.optional(types.array(types.string), []),
      statusFilter: types.optional(types.array(types.enumeration(Object.values(EPermitApplicationStatus))), []),
      unreadFilter: types.optional(types.enumeration(Object.values(ERadioFilterValue)), ERadioFilterValue.include),
      // ### SUBMISSION INDEX STUB FEATURE
      meetingRequestFilter: types.optional(
        types.enumeration(Object.values(ERadioFilterValue)),
        ERadioFilterValue.include
      ),
      // ### SUBMISSION INDEX STUB FEATURE
      daysInQueueFilter: types.optional(types.array(types.string), []),
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
    setPermitTypeFilter(value: string[]) {
      self.permitTypeFilter = cast(value)
    },
    setStatusFilter(value: EPermitApplicationStatus[]) {
      // @ts-ignore
      self.statusFilter = cast(value)
    },
    setUnreadFilter(value: ERadioFilterValue) {
      self.unreadFilter = value
    },
    // ### SUBMISSION INDEX STUB FEATURE
    setMeetingRequestFilter(value: ERadioFilterValue) {
      self.meetingRequestFilter = value
    },
    // ### SUBMISSION INDEX STUB FEATURE
    setDaysInQueueFilter(value: string[]) {
      self.daysInQueueFilter = cast(value)
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
          permitType: self.permitTypeFilter.length > 0 ? [...self.permitTypeFilter] : undefined,
          status: self.statusFilter.length > 0 ? [...self.statusFilter] : undefined,
          unread: self.unreadFilter !== ERadioFilterValue.include ? self.unreadFilter : undefined,
          // ### SUBMISSION INDEX STUB FEATURE
          meetingRequest:
            self.meetingRequestFilter !== ERadioFilterValue.include ? self.meetingRequestFilter : undefined,
          // ### SUBMISSION INDEX STUB FEATURE
          daysInQueue: self.daysInQueueFilter.length > 0 ? [...self.daysInQueueFilter] : undefined,
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
      const permitType = queryParams.get("permitType")?.split(",")
      const statusRaw = queryParams.get("status")?.split(",") as EPermitApplicationStatus[]
      const unread = queryParams.get("unread") as ERadioFilterValue
      if (permitType) self.setPermitTypeFilter(permitType)
      if (statusRaw) self.setStatusFilter(statusRaw)
      if (unread) self.setUnreadFilter(unread)
    },
  }))
  .actions((self) => ({
    resetFilters() {
      self.permitTypeFilter = cast([])
      self.statusFilter = cast([])
      self.unreadFilter = ERadioFilterValue.include
      self.meetingRequestFilter = ERadioFilterValue.include
      self.daysInQueueFilter = cast([])
      self.assignedFilter = cast([])
      self.searchJurisdictionPermitApplications({ reset: true })
    },
  }))

// ---------------------------------------------------------------------------
// Parent store: Submission Inbox
// ---------------------------------------------------------------------------

export const SubmissionInboxStoreModel = types
  .model("SubmissionInboxStore", {
    viewMode: types.optional(types.enumeration(["projects", "applications"]), "projects"),
    displayMode: types.optional(types.enumeration(["list", "columns"]), "list"),
    permitProjectSearch: types.optional(PermitProjectInboxStoreModel, {}),
    permitApplicationSearch: types.optional(PermitApplicationInboxStoreModel, {}),
  })
  .actions((self) => ({
    setViewMode(mode: "projects" | "applications") {
      self.viewMode = mode
    },
    setDisplayMode(mode: "list" | "columns") {
      self.displayMode = mode
    },
  }))

export interface ISubmissionInboxStore extends Instance<typeof SubmissionInboxStoreModel> {}
export interface IPermitProjectInboxStore extends Instance<typeof PermitProjectInboxStoreModel> {}
export interface IPermitApplicationInboxStore extends Instance<typeof PermitApplicationInboxStoreModel> {}
