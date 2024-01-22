import { Instance, types } from "mobx-state-tree"
import { EActivity, EPermitApplicationStatus, EPermitType } from "../types/enums"
import { JurisdictionModel } from "./jurisdiction"
import { UserModel } from "./user"

export const PermitApplicationModel = types
  .model("PermitApplicationModel", {
    id: types.identifier,
    nickname: types.string,
    number: types.string,
    permitTypeCode: types.enumeration(Object.values(EPermitType)),
    permitTypeName: types.string,
    activityCode: types.enumeration(Object.values(EActivity)),
    activityName: types.string,
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
    get permitType() {
      return `${self.activityName} ${self.permitTypeName}`.trim()
    },
  }))
  .actions((self) => ({
    // Define any actions here if needed
  }))

export interface IPermitApplication extends Instance<typeof PermitApplicationModel> {}
