import { Instance, types } from "mobx-state-tree"
import { EPermitApplicationStatus } from "../types/enums"
import { JurisdictionModel } from "./jurisdiction"
import { IActivity, IPermitType } from "./permit-classification"
import { UserModel } from "./user"

export const PermitApplicationModel = types
  .model("PermitApplicationModel", {
    id: types.identifier,
    nickname: types.string,
    number: types.string,
    fullAddress: types.maybeNull(types.string), //for now some seeds will not have this
    pin: types.maybeNull(types.string), //for now some seeds will not have this
    pid: types.maybeNull(types.string), //for now some seeds will not have this
    permitType: types.frozen<IPermitType>(),
    activity: types.frozen<IActivity>(),
    status: types.enumeration(Object.values(EPermitApplicationStatus)),
    submitter: types.maybe(types.reference(types.late(() => UserModel))),
    jurisdiction: types.maybe(types.reference(types.late(() => JurisdictionModel))),
    requirements: types.maybeNull(types.frozen({})),
    createdAt: types.Date,
    updatedAt: types.Date,
  })
  .views((self) => ({
    get jurisdictionName() {
      return self.jurisdiction.name
    },
    get permitTypeAndActivity() {
      return `${self.activity.name} ${self.permitType.name}`.trim()
    },
  }))
  .actions((self) => ({
    // Define any actions here if needed
  }))

export interface IPermitApplication extends Instance<typeof PermitApplicationModel> {}
