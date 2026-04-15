import * as humps from "humps"
import { t } from "i18next"
import { cast, types } from "mobx-state-tree"
import { EPermitApplicationInboxSortFields, EPermitApplicationStatus, ERadioFilterValue } from "../types/enums"
import { IPermitApplicationInboxSearchFilters } from "../types/types"
import { setQueryParam } from "../utils/utility-functions"

export function decamelizeHashKeys(hash: Record<string, number>): Record<string, number> {
  const result: Record<string, number> = {}
  for (const [key, value] of Object.entries(hash)) {
    result[humps.decamelize(key)] = value
  }
  return result
}

/** Filter snapshot + setters shared by main submission inbox application search and project permits tab. */
export const PermitApplicationInboxSearchSharedFragment = types
  .model("PermitApplicationInboxSearchShared", {
    stateCounts: types.optional(types.frozen<Record<string, number>>(), {}),
    columnTotals: types.optional(types.frozen<Record<string, number>>(), {}),
    requirementTemplateIdFilter: types.optional(types.array(types.string), []),
    statusFilter: types.optional(types.array(types.enumeration(Object.values(EPermitApplicationStatus))), []),
    unreadFilter: types.optional(types.enumeration(Object.values(ERadioFilterValue)), ERadioFilterValue.include),
    meetingRequestFilter: types.optional(
      types.enumeration(Object.values(ERadioFilterValue)),
      ERadioFilterValue.include
    ),
    daysInQueueFilter: types.maybeNull(types.frozen<{ operator: string; days: number }>()),
    assignedFilter: types.optional(types.array(types.string), []),
  })
  .views(() => ({
    getSortColumnHeader(field: EPermitApplicationInboxSortFields) {
      // @ts-ignore
      return t(`submissionInbox.applicationColumns.${field}`)
    },
  }))
  .actions((self) => ({
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
      self.statusFilter = cast(value)
      setQueryParam("status", value as unknown as string[])
    },
    setUnreadFilter(value: ERadioFilterValue) {
      self.unreadFilter = value
      setQueryParam("unread", value === ERadioFilterValue.include ? "" : value)
    },
    setMeetingRequestFilter(value: ERadioFilterValue) {
      self.meetingRequestFilter = value
    },
    setDaysInQueueFilter(value: { operator: string; days: number } | null) {
      self.daysInQueueFilter = value
      setQueryParam("daysInQueueOp", value?.operator ?? "")
      setQueryParam("daysInQueueDays", value ? value.days.toString() : "")
    },
    setAssignedFilter(value: string[]) {
      self.assignedFilter = cast(value)
    },
  }))

type IInboxApplicationFilterSlice = {
  requirementTemplateIdFilter: { length: number; readonly [n: number]: string }
  statusFilter: { length: number; readonly [n: number]: EPermitApplicationStatus }
  unreadFilter: ERadioFilterValue
  meetingRequestFilter: ERadioFilterValue
  daysInQueueFilter: { operator: string; days: number } | null
  assignedFilter: { length: number; readonly [n: number]: string }
}

export function buildJurisdictionPermitApplicationSearchFilters(
  self: IInboxApplicationFilterSlice
): IPermitApplicationInboxSearchFilters {
  return {
    requirementTemplateIds:
      self.requirementTemplateIdFilter.length > 0 ? [...self.requirementTemplateIdFilter] : undefined,
    status: self.statusFilter.length > 0 ? [...self.statusFilter] : undefined,
    unread: self.unreadFilter !== ERadioFilterValue.include ? self.unreadFilter : undefined,
    meetingRequest: self.meetingRequestFilter !== ERadioFilterValue.include ? self.meetingRequestFilter : undefined,
    daysInQueue: self.daysInQueueFilter ?? undefined,
    assigned: self.assignedFilter.length > 0 ? [...self.assignedFilter] : undefined,
  }
}

type IInboxApplicationFilterSetters = {
  setRequirementTemplateIdFilter(value: string[]): void
  setStatusFilter(value: EPermitApplicationStatus[]): void
  setUnreadFilter(value: ERadioFilterValue): void
  setDaysInQueueFilter(value: { operator: string; days: number } | null): void
}

export function applyPermitApplicationInboxFiltersFromQueryParams(
  self: IInboxApplicationFilterSetters,
  queryParams: URLSearchParams
) {
  const requirementTemplateIds = queryParams.get("requirementTemplateIds")?.split(",")
  const statusRaw = queryParams.get("status")?.split(",") as EPermitApplicationStatus[]
  const unread = queryParams.get("unread") as ERadioFilterValue
  const daysInQueueOp = queryParams.get("daysInQueueOp")
  const daysInQueueDays = queryParams.get("daysInQueueDays")
  if (requirementTemplateIds) self.setRequirementTemplateIdFilter(requirementTemplateIds)
  if (statusRaw) self.setStatusFilter(statusRaw)
  if (unread) self.setUnreadFilter(unread)
  if (daysInQueueOp && daysInQueueDays) {
    self.setDaysInQueueFilter({ operator: daysInQueueOp, days: parseInt(daysInQueueDays, 10) })
  }
}

type IInboxApplicationSearchResetSlice = IInboxApplicationFilterSetters & {
  setQuery(query: string): void
  setMeetingRequestFilter(value: ERadioFilterValue): void
  setAssignedFilter(value: string[]): void
}

export function resetPermitApplicationInboxSearchState(self: IInboxApplicationSearchResetSlice) {
  self.setQuery("")
  self.setRequirementTemplateIdFilter([])
  self.setStatusFilter([] as EPermitApplicationStatus[])
  self.setUnreadFilter(ERadioFilterValue.include)
  self.setMeetingRequestFilter(ERadioFilterValue.include)
  self.setDaysInQueueFilter(null)
  self.setAssignedFilter([])
}
