import { t } from "i18next"
import { cast, flow, Instance, types } from "mobx-state-tree"
import * as R from "ramda"
import { createSearchModel } from "../lib/create-search-model"
import { withEnvironment } from "../lib/with-environment"
import { withMerge } from "../lib/with-merge"
import { withRootStore } from "../lib/with-root-store"
import { IPermitProject, PermitProjectModel } from "../models/permit-project"
import { IPermitProjectUpdateParams, IProjectDocumentAttribute } from "../types/api-request" // Import new types
import { EPermitProjectPhase, EPermitProjectSortFields } from "../types/enums" // Import from enums
import { IPermitProjectSearchFilters, IProjectDocument, TSearchParams } from "../types/types" // Import IPermitProjectSearchFilters and IProjectDocument from types
import { setQueryParam } from "../utils/utility-functions"

// Define search filters for PermitProjects
// export interface IPermitProjectSearchFilters {
//   query?: string
//   // Add other specific filters if needed, e.g., status, submitterId
// }

export const PermitProjectStoreModel = types
  .compose(
    types.model("PermitProjectStoreModel", {
      permitProjectMap: types.map(PermitProjectModel),
      pinnedProjects: types.array(types.reference(PermitProjectModel)),
      tablePermitProjects: types.array(types.reference(PermitProjectModel)), // For table views
      currentPermitProject: types.maybeNull(types.reference(PermitProjectModel)),
      phaseFilter: types.maybeNull(types.enumeration(Object.values(EPermitProjectPhase))),
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
    // Add other views as needed
  }))
  .actions((self) => ({
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

      // Return modified data with references instead of full objects
      return R.mergeRight(permitProject, {
        owner: permitProject.owner?.id || null,
        permitApplications:
          permitProject.permitApplications?.map((app) => (typeof app === "object" ? app.id : app)) || [],
      })
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
      self.pinnedProjects = cast(projects.map((p) => p.id))
    },
  }))
  .actions((self) => ({
    searchPermitProjects: flow(function* (opts?: { reset?: boolean; page?: number; countPerPage?: number }) {
      if (opts?.reset) {
        self.resetPages() // Method from createSearchModel
      }
      const searchParams: TSearchParams<EPermitProjectSortFields, IPermitProjectSearchFilters> = {
        query: self.query, // from createSearchModel
        sort: self.sort, // from createSearchModel
        page: opts?.page ?? self.currentPage, // from createSearchModel
        perPage: opts?.countPerPage ?? self.countPerPage, // from createSearchModel
        filters: {
          showArchived: self.showArchived,
          query: self.query,
          phase: self.phaseFilter,
        },
      }

      const response = yield self.environment.api.fetchPermitProjects(searchParams)

      if (response.ok && response.data) {
        self.mergeUpdateAll(response.data.data, "permitProjectMap")
        self.setTablePermitProjects(response.data.data.map((p) => self.permitProjectMap.get(p.id)))

        self.currentPage = response.data.meta.currentPage
        self.totalPages = response.data.meta.totalPages
        self.totalCount = response.data.meta.totalCount
        self.countPerPage = response.data.meta.perPage
      } else {
        console.error("Failed to search permit projects:", response)
      }
      return response.ok
    }),
    fetchPinnedProjects: flow(function* () {
      const response = yield self.environment.api.fetchPinnedProjects()
      if (response.ok && response.data) {
        self.mergeUpdateAll(response.data.data, "permitProjectMap")
        self.setPinnedProjects(response.data.data)
      } else {
        console.error("Failed to fetch pinned projects:", response)
      }
      return response.ok
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
            file: doc.file,
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
      const phase = queryParams.get("phase") as EPermitProjectPhase
      self.phaseFilter = phase
    },
    createPermitProject: flow(function* (projectData: {
      name: string
      description?: string
      fullAddress?: string
      pid?: string
      pin?: string
      propertyPlanJurisdictionId?: string
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
    setPhaseFilter: (phase: EPermitProjectPhase | "all") => {
      if (!phase) return

      const valueToSet = phase === "all" ? null : phase
      setQueryParam("phase", valueToSet)
      self.phaseFilter = valueToSet
    },
    // PIN TODO: Move this to the project model
    togglePin: flow(function* (permitProjectId: string) {
      const project = self.permitProjectMap.get(permitProjectId)
      if (!project) return

      const originalIsPinned = project.isPinned
      // Optimistic update
      project.setIsPinned(!originalIsPinned)

      // Add to pinned list or remove from it
      if (!originalIsPinned) {
        self.pinnedProjects.push(project)
      } else {
        self.pinnedProjects.replace(self.pinnedProjects.filter((p) => p.id !== project.id))
      }

      const response = !originalIsPinned
        ? yield self.environment.api.pinPermitProject(permitProjectId)
        : yield self.environment.api.unpinPermitProject(permitProjectId)

      if (response.ok) {
        self.mergeUpdate(response.data.data, "permitProjectMap")
      } else {
        // Revert on failure
        project.setIsPinned(originalIsPinned)
        if (!originalIsPinned) {
          self.pinnedProjects.replace(self.pinnedProjects.filter((p) => p.id !== project.id))
        } else {
          self.pinnedProjects.push(project)
        }
      }
    }),
  }))

export interface IPermitProjectStore extends Instance<typeof PermitProjectStoreModel> {}
