import { t } from "i18next"
import { Instance, flow, toGenerator, types } from "mobx-state-tree"
import { createSearchModel } from "../lib/create-search-model"
import { withEnvironment } from "../lib/with-environment"
import { withRootStore } from "../lib/with-root-store"
import { IPdfForm, PdfFormModel } from "../models/pdf-form"
import { EPdfFormSortFields } from "../types/enums"
import { IOverheatingDocument } from "../types/types"

export const PdfFormStoreModel = types
  .compose(
    types.model("PdfFormStoreModel", {
      pdfFormsMap: types.map(PdfFormModel),
      tablePdfForms: types.array(types.safeReference(PdfFormModel)),
      isLoading: types.optional(types.boolean, false),
      lastCreatedForm: types.maybeNull(types.safeReference(PdfFormModel)),
      statusFilter: types.optional(types.enumeration(["all", "archived", "unarchived"]), "unarchived"),
    }),
    createSearchModel<EPdfFormSortFields>("searchPdfForms", "setPdfFormFilters")
  )
  .extend(withEnvironment())
  .extend(withRootStore())
  .views((self) => ({
    get pdfForms(): IPdfForm[] {
      return Array.from(self.pdfFormsMap.values()).sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime()
        const dateB = new Date(b.createdAt || 0).getTime()
        return dateB - dateA
      }) as IPdfForm[]
    },
    getSortColumnHeader(field: EPdfFormSortFields): string {
      return (t as any)(`singleZoneCoolingHeatingTool.coverSheet.fields.${field}`)
    },
  }))
  .actions((self) => ({
    setPdfFormFilters(queryParams: URLSearchParams) {
      const statusFilter = queryParams.get("statusFilter")
      if (statusFilter) {
        self.statusFilter = statusFilter as any
      }
    },
    searchPdfForms: flow(function* (opts?: { reset?: boolean; page?: number; countPerPage?: number }) {
      if (opts?.reset) {
        self.resetPages()
      }

      self.isLoading = true
      try {
        const response = yield* toGenerator(
          self.environment.api.getPdfForms({
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
          const pdfForms = response.data.data || []
          const meta = response.data.meta

          if (opts?.page === 1 || opts?.reset || !opts?.page) {
            self.tablePdfForms.clear()
          }

          pdfForms.forEach((form) => {
            self.pdfFormsMap.put(form)
            self.tablePdfForms.push(form.id)
          })

          self.setPageFields(meta, opts)

          return { success: true, data: pdfForms }
        } else {
          return { success: false, error: response.data }
        }
      } catch (error) {
        console.error("Error fetching PDF forms:", error)
        return { success: false, error: error.message }
      } finally {
        self.isLoading = false
      }
    }),
    createPdfForm: flow(function* (formData: {
      formJson: Record<string, any>
      formType: string
      status?: boolean
      overheatingDocumentsAttributes?: Partial<IOverheatingDocument>[]
    }) {
      self.isLoading = true
      try {
        const response = yield* toGenerator(self.environment.api.createPdfForm(formData))
        if (response.ok) {
          const createdForm = response.data.data
          if (createdForm && createdForm.id) {
            self.pdfFormsMap.put(createdForm)
            self.lastCreatedForm = createdForm.id as any
          }
          return { success: true, data: createdForm }
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
          const updatedForm = response.data.data
          if (updatedForm) {
            self.pdfFormsMap.put(updatedForm)
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
    updatePdfForm: flow(function* (
      id: string,
      data: {
        formJson?: Record<string, any>
        status?: boolean
        overheatingDocumentsAttributes?: Partial<IOverheatingDocument>[]
      }
    ) {
      self.isLoading = true
      try {
        const response = yield* toGenerator(self.environment.api.updatePdfForm(id, data))
        if (response.ok) {
          const updated = response.data.data
          if (updated && updated.id) {
            self.pdfFormsMap.put(updated)
          }
          return { success: true, data: updated }
        } else {
          return { success: false, error: response.data }
        }
      } catch (error) {
        return { success: false, error: (error as any).message }
      } finally {
        self.isLoading = false
      }
    }),
    archivePdfForm: flow(function* (id: string) {
      self.isLoading = true
      try {
        const response = yield* toGenerator(self.environment.api.archivePdf(id))
        if (response.ok) {
          const archived = response.data.data
          if (archived && archived.id) {
            self.pdfFormsMap.put(archived)
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
    setPdfForm(pdfForm: IPdfForm) {
      self.pdfFormsMap.put(pdfForm)
    },
    setStatusFilter(filter: "all" | "archived" | "unarchived") {
      self.statusFilter = filter
    },
  }))

export interface IPdfFormStore extends Instance<typeof PdfFormStoreModel> {}
