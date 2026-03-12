import { t } from "i18next"
import { cast, flow, Instance, types } from "mobx-state-tree"
import { createSearchModel } from "../lib/create-search-model"
import { withEnvironment } from "../lib/with-environment"
import { withMerge } from "../lib/with-merge"
import { withRootStore } from "../lib/with-root-store"
import { IProjectAudit, ProjectAuditModel } from "../models/project-audit"
import { EProjectAuditSortFields } from "../types/enums"
import { IProjectAuditSearchFilters, TSearchParams } from "../types/types"

export const ProjectAuditStoreModel = types
  .compose(
    types.model("ProjectAuditStoreModel", {
      projectAuditMap: types.map(ProjectAuditModel),
      tableProjectAudits: types.array(types.reference(ProjectAuditModel)),
      toFilter: types.maybeNull(types.string),
      fromFilter: types.maybeNull(types.string),
    }),
    createSearchModel<EProjectAuditSortFields>("searchProjectAudits", "setProjectAuditFilters")
  )
  .extend(withEnvironment())
  .extend(withRootStore())
  .extend(withMerge())
  .views((self) => ({
    getSortColumnHeader(field: EProjectAuditSortFields) {
      // @ts-expect-error - projectAudit translation keys may not be in i18n types yet
      return t(`projectAudit.columns.${field}`)
    },
  }))
  .actions((self) => ({
    setProjectAuditFilters(queryParams: URLSearchParams) {
      const toFilter = queryParams.get("to")
      const fromFilter = queryParams.get("from")
      if (toFilter) {
        self.toFilter = toFilter
      }
      if (fromFilter) {
        self.fromFilter = fromFilter
      }
    },
    setTableProjectAudits(projects: IProjectAudit[]) {
      self.tableProjectAudits = cast(projects.map((p) => p.id))
    },
  }))
  .actions((self) => ({
    searchProjectAudits: flow(function* (opts?: { reset?: boolean; page?: number; countPerPage?: number }) {
      if (opts?.reset) {
        self.resetPages()
      }
      const permitProjectId = self.rootStore.permitProjectStore.currentPermitProject?.id
      if (!permitProjectId) return false

      const searchParams: TSearchParams<EProjectAuditSortFields, IProjectAuditSearchFilters> = {
        query: self.query,
        sort: self.sort,
        page: opts?.page ?? self.currentPage,
        perPage: opts?.countPerPage ?? self.countPerPage,
        filters: {
          from: self.fromFilter ?? undefined,
          to: self.toFilter ?? undefined,
        },
      }

      const response = yield self.environment.api.fetchProjectAudits(permitProjectId, searchParams)

      if (response.ok && response.data) {
        self.mergeUpdateAll(response.data.data, "projectAuditMap")
        self.setTableProjectAudits(response.data.data)
        self.setPageFields(response.data.meta, opts)
      } else {
        console.error("Failed to search project audits:", response)
      }
      return response.ok
    }),
  }))

export interface IProjectAuditStore extends Instance<typeof ProjectAuditStoreModel> {}
