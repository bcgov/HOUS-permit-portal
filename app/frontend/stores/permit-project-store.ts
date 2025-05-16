import { cast, flow, Instance, SnapshotIn, types } from "mobx-state-tree"
import * as R from "ramda"
import { createSearchModel } from "../lib/create-search-model"
import { withEnvironment } from "../lib/with-environment"
import { withMerge } from "../lib/with-merge"
import { withRootStore } from "../lib/with-root-store"
import { IPermitProject, PermitProjectModel } from "../models/permit-project"
import { EPermitProjectSortFields } from "../types/enums" // Import from enums
import { IPermitProjectSearchFilters, TSearchParams } from "../types/types" // Import IPermitProjectSearchFilters from types

// Define search filters for PermitProjects
// export interface IPermitProjectSearchFilters {
//   query?: string
//   // Add other specific filters if needed, e.g., status, submitterId
// }

export const PermitProjectStoreModel = types
  .compose(
    types.model("PermitProjectStoreModel", {
      permitProjectMap: types.map(PermitProjectModel),
      tablePermitProjects: types.array(types.reference(PermitProjectModel)), // For table views
      currentPermitProject: types.maybeNull(types.reference(PermitProjectModel)),
      // Add any specific filters as simple types here, similar to PermitApplicationStore
    }),
    createSearchModel<EPermitProjectSortFields>("searchPermitProjects", "setPermitProjectFilters")
  )
  .extend(withEnvironment())
  .extend(withRootStore())
  .extend(withMerge())
  .views((self) => ({
    getSortColumnHeader(field: EPermitProjectSortFields) {
      // Translate field names to human-readable column headers
      // This might involve using a translation library like i18next if internationalization is needed
      const fieldMap = {
        [EPermitProjectSortFields.description]: "Description",
        [EPermitProjectSortFields.updatedAt]: "Last Updated",
        [EPermitProjectSortFields.createdAt]: "Created Date",
      }
      return fieldMap[field] || field
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
    // __beforeMergeUpdate is critical for handling nested data structures
    __beforeMergeUpdate(projectData: Partial<SnapshotIn<typeof PermitProjectModel>> & { id: string }) {
      // Handle primaryPermitApplication
      if (projectData.primaryPermitApplication && typeof projectData.primaryPermitApplication === "object") {
        self.rootStore.permitApplicationStore.mergeUpdate(
          projectData.primaryPermitApplication as any, // API returns full object, store needs to process it
          "permitApplicationMap"
        )
        projectData.primaryPermitApplication = (projectData.primaryPermitApplication as any).id
      } else if (
        typeof projectData.primaryPermitApplication === "object" &&
        projectData.primaryPermitApplication !== null
      ) {
        // It's already a snapshot object from elsewhere, ensure it's just the ID
        projectData.primaryPermitApplication = (projectData.primaryPermitApplication as any).id
      }

      // Handle supplementalPermitApplications
      if (projectData.supplementalPermitApplications && Array.isArray(projectData.supplementalPermitApplications)) {
        const processedApps = projectData.supplementalPermitApplications.map((app: any) => {
          if (typeof app === "object" && app !== null) {
            self.rootStore.permitApplicationStore.mergeUpdate(app, "permitApplicationMap")
            return app.id
          }
          return app // Assuming it's already an ID (string)
        })
        projectData.supplementalPermitApplications = processedApps.filter((id) => typeof id === "string") as string[]
      }

      return projectData // Return the modified data for merging
    },
    // __beforeMergeUpdateAll can optimize merging of associations for multiple projects
    __beforeMergeUpdateAll(projectsData: (Partial<SnapshotIn<typeof PermitProjectModel>> & { id: string })[]) {
      const allApplications: any[] = []
      projectsData.forEach((project) => {
        if (project.primaryPermitApplication && typeof project.primaryPermitApplication === "object") {
          allApplications.push(project.primaryPermitApplication)
        }
        if (project.supplementalPermitApplications) {
          project.supplementalPermitApplications.forEach((app) => {
            if (typeof app === "object" && app !== null) {
              allApplications.push(app)
            }
          })
        }
      })

      const uniqueApps = R.uniqBy(
        (app) => app.id,
        allApplications.filter((app) => app && app.id)
      )
      if (uniqueApps.length > 0) {
        self.rootStore.permitApplicationStore.mergeUpdateAll(uniqueApps as any[], "permitApplicationMap")
      }

      // Modify projectsData to replace full app objects with IDs, similar to __beforeMergeUpdate
      const processedProjects = projectsData.map((project) => {
        const processedProject: Partial<SnapshotIn<typeof PermitProjectModel>> & { id: string } = { ...project }
        if (
          processedProject.primaryPermitApplication &&
          typeof processedProject.primaryPermitApplication === "object"
        ) {
          processedProject.primaryPermitApplication = (processedProject.primaryPermitApplication as any).id
        }
        if (processedProject.supplementalPermitApplications) {
          processedProject.supplementalPermitApplications = processedProject.supplementalPermitApplications
            .map((app: any) => (typeof app === "object" && app !== null ? app.id : app))
            .filter((id) => typeof id === "string") as string[]
        }
        return processedProject
      })
      return processedProjects
    },
    setTablePermitProjects: (projects: IPermitProject[]) => {
      self.tablePermitProjects = cast(projects.map((p) => p.id))
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
          query: self.query, // Example filter, adapt as needed
          // Add other filters from self, if defined
        },
      }

      // Replace with actual API call
      const response = yield self.environment.api.fetchPermitProjects(searchParams)

      if (response.ok && response.data) {
        self.mergeUpdateAll(response.data.data, "permitProjectMap")
        self.setTablePermitProjects(response.data.data.map((p) => self.permitProjectMap.get(p.id)))

        self.currentPage = response.data.meta.currentPage
        self.totalPages = response.data.meta.totalPages
        self.totalCount = response.data.meta.totalCount
        self.countPerPage = response.data.meta.perPage
      } else {
        // Handle error, maybe set an error state
        console.error("Failed to search permit projects:", response)
      }
      return response.ok
    }),
    fetchPermitProject: flow(function* (id: string) {
      const response = yield self.environment.api.fetchPermitProject(id)
      if (response.ok && response.data) {
        const projectData = response.data.data // Assuming API returns { data: project }
        projectData.isFullyLoaded = true // Optional: if you track loading state per item
        self.mergeUpdate(projectData, "permitProjectMap")
        return self.permitProjectMap.get(id)
      }
      return null
    }),
    // This action is called by createSearchModel to apply filters from URL or other sources
    setPermitProjectFilters(queryParams: URLSearchParams) {
      const query = queryParams.get("query")
      if (query) {
        self.query = query // Set query from createSearchModel
      }
      // Set other filters from queryParams if they exist
      // e.g., const status = queryParams.get("status");
      // if (status) self.statusFilter = status;
    },
  }))

export interface IPermitProjectStore extends Instance<typeof PermitProjectStoreModel> {}
