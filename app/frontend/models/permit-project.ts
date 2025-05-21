import { Instance, types } from "mobx-state-tree"
import { withEnvironment } from "../lib/with-environment"
import { withRootStore } from "../lib/with-root-store"

export const PermitProjectModel = types
  .model("PermitProjectModel", {
    id: types.identifier,
    description: types.maybeNull(types.string), // Projects might not have a description initially
    createdAt: types.Date,
    updatedAt: types.Date,
  })
  .extend(withEnvironment())
  .extend(withRootStore())
  .views((self) => ({}))
  .actions((self) => ({}))

export interface IPermitProject extends Instance<typeof PermitProjectModel> {}
