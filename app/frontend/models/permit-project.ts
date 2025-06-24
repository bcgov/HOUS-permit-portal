import { Instance, types } from "mobx-state-tree"
import { withEnvironment } from "../lib/with-environment"
import { withRootStore } from "../lib/with-root-store"
import { EPermitApplicationStatus } from "../types/enums"
import { IProjectDocument } from "../types/types" // Updated import
import { PermitApplicationModel } from "./permit-application"

export const PermitProjectModel = types
  .model("PermitProjectModel", {
    id: types.identifier,
    title: types.string,
    fullAddress: types.maybeNull(types.string),
    forcastedCompletionDate: types.maybeNull(types.Date),
    phase: types.enumeration(Object.values(EPermitApplicationStatus)),
    permitApplications: types.array(types.reference(types.late(() => PermitApplicationModel))),
    projectDocuments: types.maybeNull(types.array(types.frozen<IProjectDocument>())), // Changed to IProjectDocument
    createdAt: types.Date,
    updatedAt: types.Date,
  })
  .extend(withEnvironment())
  .extend(withRootStore())
  .views((self) => ({}))
  .actions((self) => ({}))

export interface IPermitProject extends Instance<typeof PermitProjectModel> {}
