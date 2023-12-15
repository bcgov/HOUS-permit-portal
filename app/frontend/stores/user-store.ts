import { values } from "mobx"
import { Instance, flow, toGenerator, types } from "mobx-state-tree"
import * as R from "ramda"
import { withEnvironment } from "../lib/with-environment"
import { withRootStore } from "../lib/with-root-store"
import { IUser, UserModel } from "../models/user"
import { IInvitationResponse } from "../types/api-responses"

export const UserStoreModel = types
  .model("UserStoreModel")
  .props({
    usersMap: types.map(UserModel),
    currentUser: types.maybeNull(types.safeReference(UserModel)),
    invitationResponse: types.maybeNull(types.frozen<IInvitationResponse>()),
  })
  .extend(withEnvironment())
  .extend(withRootStore())
  .views((self) => ({
    get users(): IUser[] {
      //@ts-ignore
      return values(self.usersMap) as IUser[]
    },
    get invitedEmails(): string[] {
      return self.invitationResponse?.data?.invited?.map((user) => user.email)
    },
    get takenEmails(): string[] {
      return self.invitationResponse?.data?.emailTaken?.map((user) => user.email)
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
      const response = yield self.environment.api.signUp(formData)
      return response.ok
    }),
    invite: flow(function* (formData) {
      const response = yield self.environment.api.invite(formData)
      self.invitationResponse = response.data
      return response.ok
    }),
    acceptInvitation: flow(function* (params) {
      const { ok, data: response } = yield* toGenerator(self.environment.api.acceptInvitation(params))
      if (ok) {
        window.location.replace(response.meta.redirectUrl)
      }
    }),
  }))
  .actions((self) => ({}))

export interface IUserStore extends Instance<typeof UserStoreModel> {}
