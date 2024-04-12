import { Instance, applySnapshot, flow, types } from "mobx-state-tree"
import { withEnvironment } from "../lib/with-environment"
import { withRootStore } from "../lib/with-root-store"
import { EUserRoles } from "../types/enums"
import { JurisdictionModel } from "./jurisdiction"

export const UserModel = types
  .model("UserModel")
  .props({
    id: types.identifier,
    email: types.string,
    role: types.enumeration(Object.values(EUserRoles)),
    firstName: types.string,
    lastName: types.string,
    username: types.string,
    certified: types.boolean,
    organization: types.maybeNull(types.string),
    jurisdiction: types.maybeNull(types.reference(types.late(() => JurisdictionModel))),
    createdAt: types.Date,
    confirmedAt: types.maybeNull(types.Date),
    discardedAt: types.maybeNull(types.Date),
    lastSignInAt: types.maybeNull(types.Date),
    eulaAccepted: types.maybeNull(types.boolean),
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
    get name() {
      return `${self.firstName} ${self.lastName}`
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
      return response.ok
    }),
  }))

export interface IUser extends Instance<typeof UserModel> {}
