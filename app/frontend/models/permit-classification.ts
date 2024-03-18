import { Instance, types } from "mobx-state-tree"
import { EPermitClassificationCode } from "../types/enums"

export const PermitClassificationModel = types.model("PermitClassificationModel", {
  id: types.identifier,
  name: types.string,
  code: types.enumeration(Object.values(EPermitClassificationCode)),
  description: types.string,
  enabled: types.boolean,
  imageUrl: types.string,
})

// Subclass Model for PermitType
export const PermitTypeModel = PermitClassificationModel.named("PermitTypeModel").props({
  type: types.literal("PermitType"),
  // Additional properties specific to PermitType
})

// Subclass Model for Activity
export const ActivityModel = PermitClassificationModel.named("ActivityModel").props({
  type: types.literal("Activity"),
  // Additional properties specific to Activity
})

export interface IPermitClassification extends Instance<typeof PermitClassificationModel> {}
export interface IPermitType extends Instance<typeof PermitTypeModel> {}
export interface IActivity extends Instance<typeof ActivityModel> {}
