import { Instance, types } from "mobx-state-tree"
import { EPermitApplicationStatus } from "../types/enums"

export const ProjectAuditModel = types.model("ProjectAuditModel", {
  id: types.identifier,
  description: types.string,
  createdAt: types.Date,
  permitApplicationId: types.maybeNull(types.string),
  permitName: types.maybeNull(types.string),
  permitApplicationStatus: types.maybeNull(types.enumeration(Object.values(EPermitApplicationStatus))),
})

export interface IProjectAudit extends Instance<typeof ProjectAuditModel> {}
