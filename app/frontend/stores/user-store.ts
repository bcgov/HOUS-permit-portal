import { values } from "mobx"
import { Instance, flow, toGenerator, types } from "mobx-state-tree"
import * as R from "ramda"
import { createSearchModel } from "../lib/create-search-model"
import { withEnvironment } from "../lib/with-environment"
import { withMerge } from "../lib/with-merge"
import { withRootStore } from "../lib/with-root-store"
import { IUser, UserModel } from "../models/user"
import { IInvitationResponse } from "../types/api-responses"
import { EUserSortFields } from "../types/enums"
import { IEULA } from "../types/types"

export const UserStoreModel = types
  .compose(
    types.model("UserStoreModel").props({
      usersMap: types.map(UserModel),
      currentUser: types.maybeNull(types.safeReference(UserModel)),
      invitationResponse: types.maybeNull(types.frozen<IInvitationResponse>()),
      eula: types.maybeNull(types.frozen<IEULA>()),
    }),
    createSearchModel<EUserSortFields>("searchUsers", Object.values(EUserSortFields))
  )
  .extend(withEnvironment())
  .extend(withRootStore())
  .extend(withMerge())
  .views((self) => ({
    get users(): IUser[] {
      //@ts-ignore
      return values(self.usersMap) as IUser[]
    },
    get invitedEmails(): string[] {
      return self.invitationResponse?.data?.invited?.map((user) => user.email) || []
    },
    get takenEmails(): string[] {
      return self.invitationResponse?.data?.emailTaken?.map((user) => user.email) || []
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
      if (user.jurisdiction) {
        self.rootStore.jurisdictionStore.mergeUpdate(user.jurisdiction, "jurisdictionMap")
        user.jurisdiction = user.jurisdiction.id
      }
      self.usersMap.put(user)
      self.currentUser = user.id
    },
    unsetCurrentUser() {
      self.currentUser = null
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
    updateProfile: flow(function* (formData) {
      const { ok, data: response } = yield self.environment.api.updateProfile(formData)
      self.mergeUpdate(response.data, "usersMap")
      return response.ok
    }),
    fetchEULA: flow(function* () {
      const response = yield self.environment.api.getEULA()
      if (response.ok) {
        self.eula = response.data.data
        return true
      }
    }),
  }))
  .actions((self) => ({
    searchUsers: flow(function* (opts?: { reset?: boolean; page?: number; countPerPage?: number }) {
      if (opts?.reset) {
        self.resetPages()
      }

      const response = yield self.environment.api.fetchJurisdictionUsers(
        self.rootStore.jurisdictionStore.currentJurisdiction.id,
        {
          query: self.query,
          sort: self.sort,
          page: opts?.page ?? self.currentPage,
          perPage: opts?.countPerPage ?? self.countPerPage,
          showArchived: self.showArchived,
        }
      )

      if (response.ok) {
        self.mergeUpdateAll(response.data.data, "usersMap")

        self.rootStore.jurisdictionStore.currentJurisdiction.setTableUsers(response.data.data)
        self.currentPage = opts?.page ?? self.currentPage
        self.totalPages = response.data.meta.totalPages
        self.totalCount = response.data.meta.totalCount
        self.countPerPage = opts?.countPerPage ?? self.countPerPage
      }
      return response.ok
    }),
  }))

export interface IUserStore extends Instance<typeof UserStoreModel> {}
