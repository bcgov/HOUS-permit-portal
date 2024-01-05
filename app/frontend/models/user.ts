import { Instance, types } from "mobx-state-tree"
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
    jurisdiction: types.maybe(types.reference(types.late(() => JurisdictionModel))),
  })
  .extend(withRootStore())
  .extend(withEnvironment())
  .views((self) => ({
    get isSuperAdmin() {
      return self.role == EUserRoles.superAdmin
    },
    get isReviewManager() {
      return self.role == EUserRoles.reviewManager
    },
    get isReviewer() {
      return self.role == EUserRoles.reviewer
    },
    get isSubmitter() {
      return self.role == EUserRoles.submitter
    },
  }))
  .actions((self) => ({}))

export interface IUser extends Instance<typeof UserModel> {}
