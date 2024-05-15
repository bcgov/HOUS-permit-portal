import { Instance, applySnapshot, flow, types } from "mobx-state-tree"
import { withEnvironment } from "../lib/with-environment"
import { withRootStore } from "../lib/with-root-store"
import { EOmniauthProvider, EUserRoles } from "../types/enums"
import { JurisdictionModel } from "./jurisdiction"

export const UserModel = types
  .model("UserModel")
  .props({
    id: types.identifier,
    email: types.maybeNull(types.string),
    unconfirmedEmail: types.maybeNull(types.string),
    role: types.enumeration(Object.values(EUserRoles)),
    omniauthEmail: types.maybeNull(types.string),
    omniauthUsername: types.maybeNull(types.string),
    omniauthProvider: types.maybeNull(types.enumeration(Object.values(EOmniauthProvider))),
    firstName: types.maybeNull(types.string),
    lastName: types.maybeNull(types.string),
    nickname: types.maybeNull(types.string),
    certified: types.maybeNull(types.boolean),
    organization: types.maybeNull(types.string),
    jurisdictions: types.array(types.reference(types.late(() => JurisdictionModel))),
    jurisdiction: types.maybeNull(types.reference(types.late(() => JurisdictionModel))),
    createdAt: types.maybeNull(types.Date),
    confirmationSentAt: types.maybeNull(types.Date),
    confirmedAt: types.maybeNull(types.Date),
    discardedAt: types.maybeNull(types.Date),
    lastSignInAt: types.maybeNull(types.Date),
    eulaAccepted: types.maybeNull(types.boolean),
    invitedByEmail: types.maybeNull(types.string),
  })
  .extend(withRootStore())
  .extend(withEnvironment())
  .views((self) => ({
    get isSuperAdmin() {
      return self.role == EUserRoles.superAdmin
    },
    get isAdmin() {
      return self.role == EUserRoles.superAdmin || self.role == EUserRoles.reviewManager
    },
    get isReviewManager() {
      return self.role == EUserRoles.reviewManager
    },
    get isReviewer() {
      return self.role == EUserRoles.reviewer
    },
    get isReviewStaff() {
      return self.role == EUserRoles.reviewer || self.role == EUserRoles.reviewManager
    },
    get isSubmitter() {
      return self.role == EUserRoles.submitter
    },
    get isDiscarded() {
      return self.discardedAt !== null
    },
    get isUnconfirmed() {
      return self.confirmedAt == null
    },
    get name() {
      return self.firstName && self.lastName && `${self.firstName} ${self.lastName}`
    },
  }))
  .actions((self) => ({
    destroy: flow(function* () {
      const response = yield self.environment.api.destroyUser(self.id)
      if (response.ok) applySnapshot(self, response.data.data)
      return response.ok
    }),
    restore: flow(function* () {
      const response = yield self.environment.api.restoreUser(self.id)
      if (response.ok) applySnapshot(self, response.data.data)
      return response.ok
    }),
    changeRole: flow(function* () {
      let newRole = null
      if (self.role === EUserRoles.reviewManager) {
        newRole = EUserRoles.reviewer
      } else if (self.role === EUserRoles.reviewer) {
        newRole = EUserRoles.reviewManager
      } else {
        return
      }

      const response = yield self.environment.api.updateUser(self.id, { role: newRole })
      if (response.ok) applySnapshot(self, response.data.data)
      return response.ok
    }),
    acceptEULA: flow(function* () {
      const response = yield self.environment.api.acceptEULA(self.id)
      if (response.ok) {
        self.rootStore.userStore.mergeUpdate(response.data.data, "usersMap")
      }
      return response.ok
    }),
    resendConfirmation: flow(function* () {
      const response = yield self.environment.api.resendConfirmation(self.id)
      if (response.ok) {
        self.rootStore.userStore.mergeUpdate(response.data.data, "usersMap")
      }
      return response.ok
    }),
  }))

export interface IUser extends Instance<typeof UserModel> {}
