import { Instance, types } from "mobx-state-tree"
import { EBuildingType, EPermitApplicationStatus, EPermitType } from "../types/enums"
import { JurisdictionModel } from "./jurisdiction"
import { UserModel } from "./user"

export const PermitApplicationModel = types
  .model("PermitApplicationModel", {
    id: types.identifier,
    nickname: types.string,
    number: types.string,
    permitType: types.enumeration(Object.values(EPermitType)),
    buildingType: types.enumeration(Object.values(EBuildingType)),
    status: types.enumeration(Object.values(EPermitApplicationStatus)),
    submitter: types.maybe(types.reference(types.late(() => UserModel))),
    jurisdiction: types.maybe(types.reference(types.late(() => JurisdictionModel))),

    createdAt: types.Date,
    updatedAt: types.Date,
  })
  .views((self) => ({
    get jurisdictionName() {
      return self.jurisdiction.name
    },
  }))
  .actions((self) => ({
    // Define any actions here if needed
  }))

export interface IPermitApplication extends Instance<typeof PermitApplicationModel> {}
