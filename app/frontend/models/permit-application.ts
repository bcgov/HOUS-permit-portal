import { Instance, types } from "mobx-state-tree"
import { EBuildingType, EPermitApplicationStatus, EPermitType } from "../types/enums"
import Jurisdiction from "./jurisdiction"

const PermitApplication = types
  .model("PermitApplication", {
    id: types.identifier,
    permitType: types.enumeration(Object.values(EPermitType)),
    buildingType: types.enumeration(Object.values(EBuildingType)),
    status: types.enumeration(Object.values(EPermitApplicationStatus)),
    submitterId: types.string,
    jurisdiction: types.maybe(types.reference(types.late(() => Jurisdiction))),

    createdAt: types.Date,
    updatedAt: types.Date,
  })
  .actions((self) => ({
    // Define any actions here if needed
  }))

export interface IPermitApplicationModel extends Instance<typeof PermitApplication> {}

export default PermitApplication
