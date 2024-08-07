import { Instance, types } from "mobx-state-tree"
import { ECollaborationType, EPermitBlockStatus } from "../types/enums"

export const PermitBlockStatusModel = types.model("PermitBlockStatusModel", {
  id: types.identifier,
  collaborationType: types.enumeration(Object.values(ECollaborationType)),
  status: types.enumeration(Object.values(EPermitBlockStatus)),
  requirementBlockId: types.string,
  permitApplicationId: types.string,
  createdAt: types.Date,
  updatedAt: types.Date,
})

export interface IPermitBlockStatus extends Instance<typeof PermitBlockStatusModel> {}
