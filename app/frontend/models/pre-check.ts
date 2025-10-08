import { Instance, types } from "mobx-state-tree"
import { JurisdictionModel } from "./jurisdiction"

export const PreCheckModel = types.model("PreCheck", {
  id: types.identifier,
  title: types.maybeNull(types.string),
  certNumber: types.maybeNull(types.string),
  permitDate: types.maybeNull(types.Date),
  phase: types.maybeNull(types.string),
  fullAddress: types.maybeNull(types.string),
  permitApplicationId: types.maybeNull(types.string),
  jurisdiction: types.maybeNull(types.reference(types.late(() => JurisdictionModel))),
  jurisdictionId: types.maybeNull(types.string),
  checklist: types.frozen<Record<string, any>>({}),
  createdAt: types.maybeNull(types.Date),
  updatedAt: types.maybeNull(types.Date),
})

export interface IPreCheck extends Instance<typeof PreCheckModel> {}
