import { Instance, types } from "mobx-state-tree"

export const ProjectAuditModel = types.model("ProjectAuditModel", {
  id: types.identifier,
  description: types.string,
  timestamp: types.Date,
  permitApplicationId: types.maybeNull(types.string),
  permitName: types.maybeNull(types.string),
})

export interface IProjectAudit extends Instance<typeof ProjectAuditModel> {}
