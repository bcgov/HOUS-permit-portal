import { t } from "i18next"
import { cast, flow, Instance, toGenerator, types } from "mobx-state-tree"
import * as R from "ramda"
import { createSearchModel } from "../lib/create-search-model"
import { withEnvironment } from "../lib/with-environment"
import { withMerge } from "../lib/with-merge"
import { withRootStore } from "../lib/with-root-store"
import { IPermitProject, PermitProjectModel } from "../models/permit-project"
import { IPermitProjectUpdateParams, IProjectDocumentAttribute } from "../types/api-request" // Import new types
import { EPermitProjectRollupStatus, EPermitProjectSortFields } from "../types/enums" // Import from enums
import { IPermitProjectSearchFilters, IProjectDocument, TSearchParams } from "../types/types" // Import IPermitProjectSearchFilters and IProjectDocument from types
import { setQueryParam } from "../utils/utility-functions"

export const PermitProjectStoreModel = types
  .compose(
    types.model("PermitProjectStoreModel", {
      permitProjectMap: types.map(PermitProjectModel),
      pinnedPermitProjects: types.optional(types.array(types.reference(PermitProjectModel)), []),
      tablePermitProjects: types.array(types.reference(PermitProjectModel)), // For table views
      currentPermitProject: types.maybeNull(types.reference(PermitProjectModel)),
      rollupStatusFilter: types.maybeNull(types.array(types.enumeration(Object.values(EPermitProjectRollupStatus)))),
      isFetchingPinnedProjects: types.optional(types.boolean, false),
      jurisdictionFilter: types.optional(types.array(types.string), []),
      requirementTemplateIdFilter: types.optional(types.array(types.string), []),
    }),
    createSearchModel<EPermitProjectSortFields>("searchPermitProjects", "setPermitProjectFilters")
  )
  .extend(withEnvironment())
  .extend(withRootStore())
  .extend(withMerge())
  .views((self) => ({
    getSortColumnHeader(field: EPermitProjectSortFields) {
      // @ts-ignore
      return t(`permitProject.columns.${field}`)
    },
    getPermitProjectById(id: string) {
      return self.permitProjectMap.get(id)
    },
    get permitProjects() {
      return Array.from(self.permitProjectMap.values())
    },
  }))
  .actions((self) => ({
    jurisdictionOptions: flow(function* () {
      const response = yield* toGenerator(self.environment.api.fetchPermitProjectJurisdictionOptions())
      return response
    }),
    __beforeMergeUpdate(permitProject) {
      // Handle submitter
      if (permitProject.owner && typeof permitProject.owner === "object") {
        self.rootStore.userStore.mergeUpdate(permitProject.owner, "usersMap")
      }

      // Handle permit applications
      if (permitProject.permitApplications && Array.isArray(permitProject.permitApplications)) {
        permitProject.permitApplications.forEach((app) => {
          if (typeof app === "object") {
            self.rootStore.permitApplicationStore.mergeUpdate(app, "permitApplicationMap")
          }
        })
      }
      if (permitProject.recentPermitApplications && Array.isArray(permitProject.recentPermitApplications)) {
        permitProject.recentPermitApplications.forEach((app) => {
          if (typeof app === "object") {
            self.rootStore.permitApplicationStore.mergeUpdate(app, "permitApplicationMap")
          }
        })
      }

      if (permitProject.jurisdiction) {
        self.rootStore.jurisdictionStore.mergeUpdate(permitProject.jurisdiction, "jurisdictionMap")
      }

      // Return modified data with references instead of full objects
      return R.mergeRight(permitProject, {
        owner: permitProject.owner?.id || null,
        permitApplications:
          permitProject.permitApplications?.map((app) => (typeof app === "object" ? app.id : app)) || [],
        recentPermitApplications:
          permitProject.recentPermitApplications?.map((app) => (typeof app === "object" ? app.id : app)) || [],
        jurisdiction: permitProject.jurisdiction?.id,
      })
    },
    setJurisdictionFilter(value: string[]) {
      self.jurisdictionFilter = cast(value)
      const paramValue = value && value.length > 0 ? value.join(",") : null
      setQueryParam("jurisdictionFilter", paramValue)
    },
    setCurrentPermitProject(permitProjectId: string | null) {
      if (permitProjectId === null) {
        self.currentPermitProject = null
        return
      }
      const project = self.permitProjectMap.get(permitProjectId)
      if (project) {
        self.currentPermitProject = project
      }
    },
    resetCurrentPermitProject() {
      self.currentPermitProject = null
    },
    setTablePermitProjects: (projects: IPermitProject[]) => {
      self.tablePermitProjects = cast(projects.map((p) => p.id))
    },
    setPinnedProjects: (projects: IPermitProject[]) => {
      self.pinnedPermitProjects.replace(projects.map((p) => p.id) as any)
    },
  }))
  .actions((self) => ({
    searchPermitProjects: flow(function* (opts?: { reset?: boolean; page?: number; countPerPage?: number }) {
      if (opts?.reset) {
        self.resetPages() // Method from createSearchModel
      }
      const requirementTemplateIds =
        self.requirementTemplateIdFilter && self.requirementTemplateIdFilter.length > 0
          ? self.requirementTemplateIdFilter
          : undefined

      const searchParams: TSearchParams<EPermitProjectSortFields, IPermitProjectSearchFilters> = {
        query: self.query, // from createSearchModel
        sort: self.sort, // from createSearchModel
        page: opts?.page ?? self.currentPage, // from createSearchModel
        perPage: opts?.countPerPage ?? self.countPerPage, // from createSearchModel
        filters: {
          showArchived: self.showArchived,
          query: self.query,
          rollupStatus: self.rollupStatusFilter,
          jurisdictionId: self.jurisdictionFilter,
          requirementTemplateIds,
        },
      }

      const response = yield self.environment.api.fetchPermitProjects(searchParams)

      if (response.ok && response.data) {
        self.mergeUpdateAll(response.data.data, "permitProjectMap")
        self.setTablePermitProjects(response.data.data)
        self.setPageFields(response.data.meta, opts)
      } else {
        console.error("Failed to search permit projects:", response)
      }
      return response.ok
    }),
    fetchPinnedProjects: flow(function* () {
      self.isFetchingPinnedProjects = true
      try {
        const response = yield* toGenerator(self.environment.api.fetchPinnedProjects())
        if (response.ok && response.data) {
          self.mergeUpdateAll(response.data.data, "permitProjectMap")
          self.setPinnedProjects(response.data.data)
        } else {
          console.error("Failed to fetch pinned projects:", response)
        }
        return response.ok
      } catch (error) {
        console.error("Failed to fetch pinned projects:", error)
      } finally {
        self.isFetchingPinnedProjects = false
      }
    }),
    fetchPermitProject: flow(function* (id: string) {
      const response = yield self.environment.api.fetchPermitProject(id)
      if (response.ok && response.data) {
        const projectData = response.data.data
        self.mergeUpdate(projectData, "permitProjectMap")
        return self.permitProjectMap.get(id)
      }
      return null
    }),
    updateCurrentPermitProject: flow(function* (params: {
      description?: string
      projectDocuments?: Array<Partial<IProjectDocument> & { _destroy?: boolean; permitProjectId?: string }>
    }) {
      if (!self.currentPermitProject) return { ok: false, data: null }

      const apiParams: IPermitProjectUpdateParams = {
        description: params.description,
      }

      if (params.projectDocuments) {
        apiParams.projectDocumentsAttributes = params.projectDocuments.map((doc) => {
          const attribute: IProjectDocumentAttribute = {
            id: doc.id,
            permitProjectId: doc.permitProjectId,
            file: doc.file?.metadata
              ? {
                  ...doc.file,
                  metadata: {
                    ...doc.file.metadata,
                    mimeType: doc.file.metadata.mimeType ?? "",
                  },
                }
              : undefined,
            _destroy: doc._destroy,
          }
          return attribute
        })
      }

      const response = yield self.environment.api.updatePermitProject(self.currentPermitProject.id, apiParams)

      if (response.ok && response.data) {
        self.mergeUpdate(response.data.data, "permitProjectMap")
      }
      return response
    }),
    setPermitProjectFilters(queryParams: URLSearchParams) {
      const requirementTemplateFilter = queryParams.get("requirementTemplateFilter")
      const rollupStatusStr = queryParams.get("rollupStatus")
      const rollupStatus = rollupStatusStr ? (rollupStatusStr.split(",") as EPermitProjectRollupStatus[]) : null
      const jurisdictionFilter = queryParams.get("jurisdictionFilter")?.split(",")
      const requirementTemplateIdFilter = queryParams.get("requirementTemplateId")?.split(",")
      self.rollupStatusFilter = rollupStatus ? cast(rollupStatus) : null

      if (jurisdictionFilter) {
        self.setJurisdictionFilter(jurisdictionFilter)
      }
      if (requirementTemplateIdFilter) {
        // @ts-ignore
        self.setRequirementTemplateIdFilter(requirementTemplateIdFilter)
      }
    },
    createPermitProject: flow(function* (projectData: {
      title: string
      fullAddress?: string
      pid?: string
      jurisdictionId?: string
      pin?: string
    }) {
      const response = yield self.environment.api.createPermitProject(projectData)
      if (response.ok && response.data?.data) {
        self.mergeUpdate(response.data.data, "permitProjectMap")
        const newProjectId = response.data.data.id // Get id from response
        const newProject = self.permitProjectMap.get(newProjectId) // Get the model instance from the map
        if (newProject) {
          self.setCurrentPermitProject(newProject.id)
          return { ok: true, data: newProject }
        } else {
          // Should not happen if mergeUpdate and response were successful
          console.error("Failed to retrieve new project from map after creation.")
          return { ok: false, error: "Failed to retrieve project post-creation." }
        }
      } else {
        console.error("Failed to create permit project:", response.problem, response.data)
        return { ok: false, error: response.data?.meta?.message || response.problem }
      }
    }),
    setRollupStatusFilter(value: EPermitProjectRollupStatus[]) {
      self.rollupStatusFilter = value.length > 0 ? cast(value) : null
      const paramValue = value.length > 0 ? value.join(",") : null
      setQueryParam("rollupStatus", paramValue)
    },
    updatePermitProject: flow(function* (id: string, params: IPermitProjectUpdateParams) {
      const response = yield self.environment.api.updatePermitProject(id, params)
      if (response.ok && response.data) {
        self.mergeUpdate(response.data.data, "permitProjectMap")
      }
      return response
    }),
    setRequirementTemplateIdFilter(requirementTemplateIds: string[] | undefined) {
      if (!requirementTemplateIds) return
      setQueryParam("requirementTemplateId", requirementTemplateIds)
      // @ts-ignore
      self.requirementTemplateIdFilter = requirementTemplateIds
    },
  }))

export interface IPermitProjectStore extends Instance<typeof PermitProjectStoreModel> {}
