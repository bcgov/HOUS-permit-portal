import { types } from "mobx-state-tree"
import { EStepCodeParentType } from "../types/enums"

// Define the base fields shared between Part3 and Part9 StepCode models
export const StepCodeBaseFields = types.model("StepCodeBaseFields", {
  parentType: types.maybeNull(types.enumeration(Object.values(EStepCodeParentType))),
  parentId: types.maybeNull(types.string),
  projectName: types.maybeNull(types.string),
  projectIdentifier: types.maybeNull(types.string),
  projectAddress: types.maybeNull(types.string),
  jurisdictionName: types.maybeNull(types.string),
  permitDate: types.maybeNull(types.string), // Consider types.Date if you parse/format dates
})
