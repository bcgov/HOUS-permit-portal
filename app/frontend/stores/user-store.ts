import { values } from "mobx"
import { Instance, flow, types } from "mobx-state-tree"
import * as R from "ramda"
import { withEnvironment } from "../lib/with-environment"
import { withRootStore } from "../lib/with-root-store"
import { IUser, UserModel } from "../models/user"
// import { IUser, UserModel } from "../models/user"

export const UserStoreModel = types
  .model("UserStoreModel")
  .props({
    usersMap: types.map(UserModel),
    currentUser: types.maybeNull(types.safeReference(UserModel)),
  })
  .extend(withEnvironment())
  .extend(withRootStore())
  .views((self) => ({
    get users(): IUser[] {
      //@ts-ignore
      return values(self.usersMap) as IUser[]
    },
  }))
  .views((self) => ({
    getUser(id) {
      return self.users.find((u) => u.id == id)
    },
    isCurrentUser(user) {
      return user.id == self.currentUser.id
    },
  }))
  .actions((self) => ({
    setUsers(users) {
      R.forEach((u) => self.usersMap.put(u), users)
    },
    removeUser(removedUser) {
      self.usersMap.delete(removedUser.id)
    },
    setCurrentUser(user) {
      self.usersMap.put(user)
      self.currentUser = user.id
    },
    signUp: flow(function* (formData) {
      return yield self.environment.api.signUp(formData)
    }),
  }))
  .actions((self) => ({}))

export interface IUserStore extends Instance<typeof UserStoreModel> {}
