import { types } from "mobx-state-tree"
import { withEnvironment } from "../lib/with-environment"
import { IUIStore, UIStoreModel } from "./ui-store"

export const RootStoreModel = types
  .model("RootStoreModel")
  .props({
    uiStore: types.optional(UIStoreModel, {}),
  })
  .extend(withEnvironment())
  .views((self) => ({}))
  .actions((self) => ({}))

export interface IRootStore extends IStateTreeNode {
  uiStore: IUIStore
}
