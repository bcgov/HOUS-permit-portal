import { Instance, types } from "mobx-state-tree"
import { EPermitBlockStatus } from "../types/enums"

export const PermitBlockStatusModel = types.model("PermitBlockStatusModel", {
  id: types.identifier,
  status: types.enumeration(Object.values(EPermitBlockStatus)),
  requirementBlockId: types.string,
  permitApplicationId: types.string,
  createdAt: types.Date,
  updatedAt: types.Date,
})

export interface IPermitBlockStatus extends Instance<typeof PermitBlockStatusModel> {}
