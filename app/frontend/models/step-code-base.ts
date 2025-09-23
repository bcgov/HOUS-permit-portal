import { flow, toGenerator, types } from "mobx-state-tree"
import { IReportDocument } from "../types/types"
import { JurisdictionModel } from "./jurisdiction"

// Define the base fields shared between Part3 and Part9 StepCode models
export const StepCodeBaseFields = types
  .model("StepCodeBaseFields", {
    createdAt: types.maybeNull(types.Date),
    updatedAt: types.maybeNull(types.Date),
    title: types.maybeNull(types.string),
    referenceNumber: types.maybeNull(types.string),
    fullAddress: types.maybeNull(types.string),
    jurisdictionName: types.maybeNull(types.string),
    jurisdiction: types.maybeNull(types.reference(types.late(() => JurisdictionModel))),
    permitDate: types.maybeNull(types.Date),
    phase: types.maybeNull(types.string),
    permitProjectTitle: types.maybeNull(types.string),
    reportDocuments: types.maybeNull(types.array(types.frozen<IReportDocument>())),
  })
  .views((self) => ({
    get latestReportDocument(): IReportDocument | null {
      if (!self.reportDocuments || self.reportDocuments.length === 0) return null
      // documents are not guaranteed to be sorted; sort by createdAt if present, fallback to last
      const docs = [...self.reportDocuments]
      docs.sort((a, b) => (new Date(a.createdAt as any).getTime() || 0) - (new Date(b.createdAt as any).getTime() || 0))
      return docs[docs.length - 1]
    },
  }))
  .actions((self) => ({
    setProjectDetails(projectDetails: { title: string; fullAddress: string; referenceNumber?: string }) {
      self.title = projectDetails.title
      self.fullAddress = projectDetails.fullAddress
      if (projectDetails.referenceNumber !== undefined) self.referenceNumber = projectDetails.referenceNumber
    },
    update: flow(function* (
      data: Partial<{
        fullAddress: string
        referenceNumber: string
        title: string
        permitDate: string
        phase: string
        jurisdictionId: string
      }>
    ) {
      // @ts-ignore environment provided by composed models (Part3/Part9)
      const response = yield* toGenerator(self.environment.api.updateStepCode(self.id as any, data))
      if (response.ok) {
        // @ts-ignore rootStore provided by withRootStore on composed models
        self.rootStore.stepCodeStore.mergeUpdate(response.data.data, "stepCodesMap")
      }
      return response.ok
    }),
  }))
