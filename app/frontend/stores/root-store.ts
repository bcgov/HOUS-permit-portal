import { IStateTreeNode, types } from "mobx-state-tree"
import { withEnvironment } from "../lib/with-environment"
import { ISessionStore, SessionStoreModel } from "./session-store"
import { IUIStore, UIStoreModel } from "./ui-store"
import { IUserStore, UserStoreModel } from "./user-store"

export const RootStoreModel = types
  .model("RootStoreModel")
  .props({
    uiStore: types.optional(UIStoreModel, {}),
    sessionStore: types.optional(SessionStoreModel, {}),
    userStore: types.optional(UserStoreModel, {}),
  })
  .extend(withEnvironment())
  .views((self) => ({}))
  .actions((self) => ({}))

export interface IRootStore extends IStateTreeNode {
  uiStore: IUIStore
  sessionStore: ISessionStore
  userStore: IUserStore
}
