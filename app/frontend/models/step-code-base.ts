import { types } from "mobx-state-tree"

// Define the base fields shared between Part3 and Part9 StepCode models
export const StepCodeBaseFields = types.model("StepCodeBaseFields", {
  projectName: types.maybeNull(types.string),
  projectIdentifier: types.maybeNull(types.string),
  projectAddress: types.maybeNull(types.string),
  jurisdictionName: types.maybeNull(types.string),
  permitDate: types.maybeNull(types.string), // Consider types.Date if you parse/format dates
  parentType: types.maybeNull(types.string),
  parentId: types.maybeNull(types.string),
})
