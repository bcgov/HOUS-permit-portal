import { Instance, flow, types } from "mobx-state-tree"
import { withEnvironment } from "../lib/with-environment"
import { withRootStore } from "../lib/with-root-store"
import { IPdfForm, PdfFormModel } from "../models/pdf-form"

export enum EPdfFormSortFields {
  createdAt = "createdAt",
  formType = "formType",
}

export const PdfFormStoreModel = types
  .model("PdfFormStoreModel", {
    pdfFormsMap: types.map(PdfFormModel),
    isLoading: types.optional(types.boolean, false),
    lastCreatedForm: types.maybeNull(types.safeReference(PdfFormModel)),
    // Search properties
    query: types.maybeNull(types.string),
    currentPage: types.optional(types.number, 1),
    totalPages: types.maybeNull(types.number),
    totalCount: types.maybeNull(types.number),
    countPerPage: types.optional(types.number, 10),
    isSearching: types.optional(types.boolean, false),
  })
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
    get tablePdfForms(): IPdfForm[] {
      let forms = Array.from(self.pdfFormsMap.values())

      // Apply search filter
      if (self.query) {
        const query = self.query.toLowerCase()
        forms = forms.filter((form) => {
          return (
            form.formType?.toLowerCase().includes(query) ||
            form.id?.toLowerCase().includes(query) ||
            form.createdAt?.toLocaleDateString().toLowerCase().includes(query) ||
            form.formJson?.projectNumber?.toLowerCase().includes(query)
          )
        })
      }

      return forms as IPdfForm[]
    },
    getSortColumnHeader(field: EPdfFormSortFields): string {
      switch (field) {
        case EPdfFormSortFields.createdAt:
          return "Created At"
        case EPdfFormSortFields.formType:
          return "Project Number"
        default:
          return field
      }
    },
  }))
  .actions((self) => {
    const searchPdfForms = flow(function* (opts?: { page?: number; countPerPage?: number }) {
      self.isLoading = true
      try {
        const params: any = {
          page: opts?.page || self.currentPage,
          per_page: opts?.countPerPage || self.countPerPage,
        }

        if (self.query && self.query.trim()) {
          params.query = self.query.trim()
        }

        const response = yield self.environment.api.getPdfForms(params)
        if (response.ok) {
          const pdfForms = response.data.data
          const meta = response.data.meta

          // Clear existing forms if this is a fresh search
          if (opts?.page === 1 || !opts?.page) {
            self.pdfFormsMap.clear()
          }

          if (Array.isArray(pdfForms)) {
            pdfForms.forEach((form) => {
              if (form && form.id) {
                self.pdfFormsMap.put(form)
              }
            })
          }

          // Set pagination metadata
          if (meta) {
            self.currentPage = opts?.page ?? meta.currentPage ?? self.currentPage
            self.totalPages = meta.totalPages ?? self.totalPages
            self.totalCount = meta.totalCount ?? self.totalCount
            self.countPerPage = opts?.countPerPage ?? meta.perPage ?? self.countPerPage
          }

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
    })

    return {
      setPdfForm(pdfForm: IPdfForm) {
        self.pdfFormsMap.put(pdfForm)
      },
      setPdfForms(pdfForms: IPdfForm[]) {
        pdfForms.forEach((pdfForm) => self.pdfFormsMap.put(pdfForm))
      },
      setLoading(loading: boolean) {
        self.isLoading = loading
      },
      createPdfForm: flow(function* (formData: { formJson: any; formType: string; status?: boolean }) {
        try {
          const response = yield self.environment.api.createPdfForm(formData)
          if (response.ok) {
            const createdForm = response.data.data
            if (createdForm && createdForm.id) {
              self.pdfFormsMap.put(createdForm)
              self.lastCreatedForm = createdForm.id
            }
            return { success: true, data: createdForm }
          } else {
            return { success: false, error: response.data }
          }
        } catch (error) {
          return { success: false, error: error.message }
        } finally {
          self.isLoading = false
        }
      }),
      searchPdfForms,
      setQuery(query: string) {
        self.query = !!query?.trim() ? query : null
      },
      setCurrentPage(page: number) {
        self.currentPage = page
      },
      setCountPerPage(count: number) {
        self.countPerPage = count
      },

      // Keep the old method for backward compatibility
      getPdfForms: flow(function* () {
        return yield searchPdfForms()
      }),
      generatePdf: flow(function* (id: string) {
        console.log("Generating PDF for form:", id)
        self.isLoading = true
        try {
          const response = yield self.environment.api.generatePdf(id)
          if (response.ok) {
            return { success: true, data: response.data }
          } else {
            return { success: false, error: response.data }
          }
        } catch (error) {
          return { success: false, error: error.message }
        } finally {
          self.isLoading = false
        }
      }),

      updatePdfForm: flow(function* (id: string, data: { formJson?: any; status?: boolean }) {
        self.isLoading = true
        try {
          const response = yield self.environment.api.updatePdfForm(id, data)
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
          return { success: false, error: error.message }
        } finally {
          self.isLoading = false
        }
      }),
    }
  })

export interface IPdfFormStore extends Instance<typeof PdfFormStoreModel> {}
