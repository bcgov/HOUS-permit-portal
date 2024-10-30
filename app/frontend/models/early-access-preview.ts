import { Instance, types } from "mobx-state-tree"
import { UserModel } from "./user"

export const EarlyAccessPreviewModel = types.model("EarlyAccessPreviewModel", {
  id: types.identifier,
  createdAt: types.Date,
  expiresAt: types.Date,
  previewer: types.safeReference(UserModel),
})

export interface IEarlyAccessPreview extends Instance<typeof EarlyAccessPreviewModel> {}
