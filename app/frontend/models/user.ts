import { Instance, types } from "mobx-state-tree"
import { withEnvironment } from "../lib/with-environment"
import { withRootStore } from "../lib/with-root-store"

export const UserModel = types
  .model("UserModel")
  .props({
    id: types.identifier,
    email: types.string,
    username: types.string,
    certified: types.boolean,
  })
  .extend(withRootStore())
  .extend(withEnvironment())
  .views((self) => ({}))
  .actions((self) => ({}))
export interface IUser extends Instance<typeof UserModel> {}
