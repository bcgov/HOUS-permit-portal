import { Instance, types } from "mobx-state-tree"
import { withEnvironment } from "../lib/with-environment"

export const RootStoreModel = types
  .model("RootStoreModel")
  .props({})
  .extend(withEnvironment())
  .views((self) => ({}))
  .actions((self) => ({}))

export interface IRootStore extends Instance<typeof RootStoreModel> {}
