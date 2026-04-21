import { cast, flow, types } from "mobx-state-tree"
import { createSearchModel } from "../lib/create-search-model"
import { EInboxDisplayMode, EPermitApplicationInboxSortFields } from "../types/enums"
import { IPermitApplicationInboxSearchFilters, TSearchParams } from "../types/types"
import {
  PermitApplicationInboxSearchSharedFragment,
  applyPermitApplicationInboxFiltersFromQueryParams,
  buildJurisdictionPermitApplicationSearchFilters,
  resetPermitApplicationInboxSearchState,
} from "./permit-application-inbox-search-shared"

const KANBAN_PER_COLUMN = 10

/**
 * Inbox permit-application search + pagination (createSearchModel) for a single permit project
 * (reviewer project detail "Permits" tab). Composed onto PermitProjectModel.
 */
export const PermitProjectInboxApplicationSearchSlice = types
  .compose(
    PermitApplicationInboxSearchSharedFragment,
    createSearchModel<EPermitApplicationInboxSortFields>(
      "searchJurisdictionPermitApplicationsForProject",
      "setJurisdictionPermitApplicationFiltersForProject"
    )
  )
  .actions((self) => ({
    searchJurisdictionPermitApplicationsForProject: flow(function* (opts?: {
      reset?: boolean
      page?: number
      countPerPage?: number
    }) {
      const project = self as any
      if (opts?.reset) {
        self.resetPages()
      }

      const isKanban = project.displayMode === EInboxDisplayMode.columns
      const jurisdictionId = project.jurisdiction?.id as string | undefined
      if (!jurisdictionId) return false

      const searchParams: TSearchParams<EPermitApplicationInboxSortFields, IPermitApplicationInboxSearchFilters> = {
        query: self.query,
        sort: self.sort,
        page: isKanban ? undefined : (opts?.page ?? self.currentPage),
        perPage: isKanban ? undefined : (opts?.countPerPage ?? self.countPerPage),
        mode: isKanban ? "kanban" : "list",
        perColumn: isKanban ? KANBAN_PER_COLUMN : undefined,
        permitProjectId: project.id,
        filters: buildJurisdictionPermitApplicationSearchFilters(self),
      }

      const response = yield project.environment.api.fetchJurisdictionPermitApplications(jurisdictionId, searchParams)

      if (response.ok) {
        project.rootStore.permitApplicationStore.mergeUpdateAll(response.data.data, "permitApplicationMap")
        project.inboxTablePermitApplications = cast(response.data.data.map((pa: { id: string }) => pa.id))
        self.setPageFields(response.data.meta, opts)
        if (response.data.meta?.statusCounts) {
          self.setStateCounts(response.data.meta.statusCounts)
        }
        if (response.data.meta?.columnTotals) {
          self.setColumnTotals(response.data.meta.columnTotals)
        }
        if (response.data.meta?.unreadCount != null) {
          self.setUnreadCount(response.data.meta.unreadCount)
        }
      }
      return response.ok
    }),
    setJurisdictionPermitApplicationFiltersForProject(queryParams: URLSearchParams) {
      applyPermitApplicationInboxFiltersFromQueryParams(self, queryParams)
    },
  }))
  .actions((self) => ({
    resetFilters() {
      resetPermitApplicationInboxSearchState(self)
      return self.searchJurisdictionPermitApplicationsForProject({ reset: true })
    },
  }))
