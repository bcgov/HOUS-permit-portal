import { Instance, types } from "mobx-state-tree"
import { withRootStore } from "../lib/with-root-store"
import { FlashMessageModel } from "../models/flash-message"

export const UIStoreModel = types
  .model("UIStoreModel")
  .props({
    flashMessage: types.optional(FlashMessageModel, {}),
  })
  .extend(withRootStore())
  .views((self) => ({}))
  .actions((self) => ({}))

export interface IUIStore extends Instance<typeof UIStoreModel> {}
