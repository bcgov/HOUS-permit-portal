import { t } from "i18next"
import { cast, flow, Instance, types } from "mobx-state-tree"
import { createSearchModel } from "../lib/create-search-model"
import { withEnvironment } from "../lib/with-environment"
import { withRootStore } from "../lib/with-root-store"
import { decamelizeHashKeys } from "../models/permit-application-inbox-search-shared"
import { ProjectMeetingModel } from "../models/project-meeting"
import { EProjectMeetingSortFields, EProjectMeetingStatus, ERadioFilterValue } from "../types/enums"
import { IProjectMeetingInboxSearchFilters, TSearchParams } from "../types/types"
import { setQueryParam } from "../utils/utility-functions"

export const ProjectMeetingInboxStoreModel = types
  .compose(
    types.model("ProjectMeetingInboxStore", {
      tableProjectMeetings: types.array(types.reference(ProjectMeetingModel)),
      statusCounts: types.optional(types.frozen<Record<string, number>>(), {}),
      unreadCount: types.optional(types.number, 0),
      statusFilter: types.optional(types.array(types.enumeration(Object.values(EProjectMeetingStatus))), []),
      unreadFilter: types.optional(types.enumeration(Object.values(ERadioFilterValue)), ERadioFilterValue.include),
    }),
    createSearchModel<EProjectMeetingSortFields>(
      "searchJurisdictionProjectMeetings",
      "setJurisdictionProjectMeetingFilters"
    )
  )
  .extend(withEnvironment())
  .extend(withRootStore())
  .views(() => ({
    getSortColumnHeader(field: EProjectMeetingSortFields) {
      // @ts-ignore
      return t(`submissionInbox.meetingColumns.${field}`)
    },
  }))
  .actions((self) => ({
    setTableProjectMeetings(projectMeetings) {
      self.tableProjectMeetings = cast(projectMeetings.map((projectMeeting) => projectMeeting.id))
    },
    setStatusCounts(counts: Record<string, number>) {
      self.statusCounts = decamelizeHashKeys(counts)
    },
    setUnreadCount(count: number) {
      self.unreadCount = count ?? 0
    },
    adjustUnreadCount(delta: number) {
      self.unreadCount = Math.max(0, self.unreadCount + delta)
    },
    setStatusFilter(value: EProjectMeetingStatus[]) {
      self.statusFilter = cast(value)
      setQueryParam("status", value)
    },
    setUnreadFilter(value: ERadioFilterValue) {
      self.unreadFilter = value
      setQueryParam("unread", value === ERadioFilterValue.include ? "" : value)
    },
  }))
  .actions((self) => ({
    searchJurisdictionProjectMeetings: flow(function* (opts?: {
      reset?: boolean
      page?: number
      countPerPage?: number
    }) {
      if (opts?.reset) {
        self.resetPages()
      }

      const searchParams: TSearchParams<EProjectMeetingSortFields, IProjectMeetingInboxSearchFilters> = {
        query: self.query,
        sort: self.sort,
        page: opts?.page ?? self.currentPage,
        perPage: opts?.countPerPage ?? self.countPerPage,
        filters: {
          status: self.statusFilter.length > 0 ? [...self.statusFilter] : undefined,
          unread: self.unreadFilter !== ERadioFilterValue.include ? self.unreadFilter : undefined,
        },
      }

      const currentJurisdictionId = self.rootStore?.jurisdictionStore?.currentJurisdiction?.id
      if (!currentJurisdictionId) return false

      const response = yield self.environment.api.fetchJurisdictionProjectMeetings(currentJurisdictionId, searchParams)

      if (response.ok && response.data) {
        self.rootStore.projectMeetingStore.mergeUpdateAll(response.data.data, "projectMeetingsMap")
        self.setTableProjectMeetings(response.data.data)
        self.setPageFields(response.data.meta, opts)
        if (response.data.meta?.statusCounts) {
          self.setStatusCounts(response.data.meta.statusCounts)
        }
        if (response.data.meta?.unreadCount != null) {
          self.setUnreadCount(response.data.meta.unreadCount)
        }
      }
      return response.ok
    }),
    setJurisdictionProjectMeetingFilters(queryParams: URLSearchParams) {
      const status = queryParams.get("status")?.split(",") as EProjectMeetingStatus[] | undefined
      const unread = queryParams.get("unread") as ERadioFilterValue
      if (status) self.setStatusFilter(status)
      if (unread) self.setUnreadFilter(unread)
    },
  }))
  .actions((self) => ({
    resetFilters() {
      self.setQuery("")
      self.setStatusFilter([])
      self.setUnreadFilter(ERadioFilterValue.include)
      self.searchJurisdictionProjectMeetings({ reset: true })
    },
  }))

export interface IProjectMeetingInboxStore extends Instance<typeof ProjectMeetingInboxStoreModel> {}
