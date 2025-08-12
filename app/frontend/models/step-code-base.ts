import { types } from "mobx-state-tree"
import { IReportDocument } from "../types/types"

// Define the base fields shared between Part3 and Part9 StepCode models
export const StepCodeBaseFields = types
  .model("StepCodeBaseFields", {
    createdAt: types.maybeNull(types.Date),
    updatedAt: types.maybeNull(types.Date),
    projectName: types.maybeNull(types.string),
    projectIdentifier: types.maybeNull(types.string),
    fullAddress: types.maybeNull(types.string),
    jurisdictionName: types.maybeNull(types.string),
    permitDate: types.maybeNull(types.string), // Consider types.Date if you parse/format dates
    // Keep documents as frozen objects to avoid circular type imports
    reportDocuments: types.maybeNull(types.array(types.frozen<IReportDocument>())),
  })
  .actions((self) => ({
    setProjectDetails(projectDetails: { projectName: string; fullAddress: string; projectIdentifier: string }) {
      self.projectName = projectDetails.projectName
      self.fullAddress = projectDetails.fullAddress
      self.projectIdentifier = projectDetails.projectIdentifier
    },
  }))
