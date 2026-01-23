import { t } from "i18next"
import { Instance, flow, toGenerator, types } from "mobx-state-tree"
import { createSearchModel } from "../lib/create-search-model"
import { withEnvironment } from "../lib/with-environment"
import { withRootStore } from "../lib/with-root-store"
import { IOverheatingTool, OverheatingToolModel } from "../models/overheating-tool"
import { EOverheatingToolSortFields, EOverheatingToolStatusFilter, EPdfGenerationStatus } from "../types/enums"
import { IOverheatingDocument, IOverheatingToolJson } from "../types/types"

export const OverheatingToolStoreModel = types
  .compose(
    types.model("OverheatingToolStoreModel", {
      overheatingToolsMap: types.map(OverheatingToolModel),
      tableOverheatingTools: types.array(types.safeReference(OverheatingToolModel)),
      isLoading: types.optional(types.boolean, false),
      lastCreatedTool: types.maybeNull(types.safeReference(OverheatingToolModel)),
      statusFilter: types.optional(
        types.enumeration(Object.values(EOverheatingToolStatusFilter)),
        EOverheatingToolStatusFilter.unarchived
      ),
    }),
    createSearchModel<EOverheatingToolSortFields>("searchOverheatingTools", "setOverheatingToolFilters")
  )
  .extend(withEnvironment())
  .extend(withRootStore())
  .views((self) => ({
    get overheatingTools(): IOverheatingTool[] {
      return Array.from(self.overheatingToolsMap.values()).sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime()
        const dateB = new Date(b.createdAt || 0).getTime()
        return dateB - dateA
      }) as IOverheatingTool[]
    },
    getSortColumnHeader(field: EOverheatingToolSortFields): string {
      return (t as any)(`singleZoneCoolingHeatingTool.coverSheet.fields.${field}`)
    },
  }))
  .views((self) => ({
    get currentTool(): IOverheatingTool | undefined {
      return (self.lastCreatedTool as IOverheatingTool) || self.overheatingTools?.[0]
    },
  }))
  .views((self) => ({
    get isCurrentToolPdfReady(): boolean {
      return self.currentTool?.pdfGenerationStatus === EPdfGenerationStatus.completed
    },
  }))
  .actions((self) => ({
    setOverheatingToolFilters(queryParams: URLSearchParams) {
      const statusFilter = queryParams.get("statusFilter")
      if (statusFilter) {
        self.statusFilter = statusFilter as any
      }
    },
    searchOverheatingTools: flow(function* (opts?: { reset?: boolean; page?: number; countPerPage?: number }) {
      if (opts?.reset) {
        self.resetPages()
      }

      self.isLoading = true
      try {
        const response = yield* toGenerator(
          self.environment.api.getOverheatingTools({
            query: self.query,
            sort: self.sort,
            page: opts?.page ?? self.currentPage,
            perPage: opts?.countPerPage ?? self.countPerPage,
            filters: {
              statusFilter: self.statusFilter,
            },
          })
        )
        if (response.ok) {
          const overheatingTools = response.data.data || []
          const meta = response.data.meta

          if (opts?.page === 1 || opts?.reset || !opts?.page) {
            self.tableOverheatingTools.clear()
          }

          overheatingTools.forEach((tool) => {
            self.overheatingToolsMap.put(tool)
            self.tableOverheatingTools.push(tool.id as any)
          })

          self.setPageFields(meta, opts)

          return { success: true, data: overheatingTools }
        } else {
          return { success: false, error: response.data }
        }
      } catch (error) {
        console.error("Error fetching overheating tools:", error)
        return { success: false, error: (error as any).message }
      } finally {
        self.isLoading = false
      }
    }),
    fetchOverheatingTool: flow(function* (id: string) {
      self.isLoading = true
      try {
        const response = yield* toGenerator(self.environment.api.fetchOverheatingTool(id))
        if (response.ok) {
          const overheatingTool = response.data.data
          if (overheatingTool) {
            self.overheatingToolsMap.put(overheatingTool)
          }
          return { success: true, data: overheatingTool }
        } else {
          return { success: false, error: response.data }
        }
      } catch (error) {
        return { success: false, error: (error as any).message }
      } finally {
        self.isLoading = false
      }
    }),
    createOverheatingTool: flow(function* (formData: {
      formJson: IOverheatingToolJson
      formType: string
      overheatingDocumentsAttributes?: Partial<IOverheatingDocument>[]
    }) {
      self.isLoading = true
      try {
        const response = yield* toGenerator(self.environment.api.createOverheatingTool(formData))
        if (response.ok) {
          const createdTool = response.data.data
          if (createdTool && createdTool.id) {
            self.overheatingToolsMap.put(createdTool)
            self.lastCreatedTool = createdTool.id as any
          }
          return { success: true, data: createdTool }
        } else {
          return { success: false, error: response.data }
        }
      } catch (error) {
        return { success: false, error: (error as any).message }
      } finally {
        self.isLoading = false
      }
    }),
    generatePdf: flow(function* (id: string) {
      self.isLoading = true
      try {
        const response = yield* toGenerator(self.environment.api.generatePdf(id))
        if (response.ok) {
          const updatedTool = response.data.data
          if (updatedTool) {
            self.overheatingToolsMap.put(updatedTool)
          }
          return { success: true, data: response.data }
        } else {
          return { success: false, error: response.data }
        }
      } catch (error) {
        return { success: false, error: (error as any).message }
      } finally {
        self.isLoading = false
      }
    }),
    archiveOverheatingTool: flow(function* (id: string) {
      self.isLoading = true
      try {
        const response = yield* toGenerator(self.environment.api.archiveOverheatingTool(id))
        if (response.ok) {
          const archived = response.data.data
          if (archived && archived.id) {
            self.overheatingToolsMap.put(archived)
          }
          return { success: true, data: archived }
        } else {
          return { success: false, error: response.data }
        }
      } catch (error) {
        return { success: false, error: (error as any).message }
      } finally {
        self.isLoading = false
      }
    }),
    setOverheatingTool(overheatingTool: IOverheatingTool) {
      self.overheatingToolsMap.put(overheatingTool)
    },
    setStatusFilter(filter: EOverheatingToolStatusFilter) {
      self.statusFilter = filter
    },
  }))

export interface IOverheatingToolStore extends Instance<typeof OverheatingToolStoreModel> {}
