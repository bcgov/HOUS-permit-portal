import { Instance, flow, types } from "mobx-state-tree"
import { withEnvironment } from "../lib/with-environment"
import { withRootStore } from "../lib/with-root-store"
import { IPdfForm, PdfFormModel } from "../models/pdf-form"

export const PdfFormStoreModel = types
  .model("PdfFormStoreModel", {
    pdfFormsMap: types.map(PdfFormModel),
    isLoading: types.optional(types.boolean, false),
    lastCreatedForm: types.maybeNull(types.safeReference(PdfFormModel)),
  })
  .extend(withEnvironment())
  .extend(withRootStore())
  .views((self) => ({
    get pdfForms(): IPdfForm[] {
      return Array.from(self.pdfFormsMap.values()) as IPdfForm[]
    },
  }))
  .actions((self) => ({
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
    getPdfForms: flow(function* () {
      self.isLoading = true
      try {
        const response = yield self.environment.api.getPdfForms()
        if (response.ok) {
          const pdfForms = response.data.data
          if (Array.isArray(pdfForms)) {
            pdfForms.forEach((form) => {
              if (form && form.id) {
                self.pdfFormsMap.put(form)
              }
            })
          }
          return { success: true, data: pdfForms }
        } else {
          return { success: false, error: response.data }
        }
      } catch (error) {
        console.error("Error fetching PDF forms:", error)
      } finally {
        self.isLoading = false
      }
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
  }))

export interface IPdfFormStore extends Instance<typeof PdfFormStoreModel> {}
