import { Instance, types } from "mobx-state-tree"
import { ECollaborationType, ECollaboratorType } from "../types/enums"
import { CollaboratorModel } from "./collaborator"

export const PermitCollaborationModel = types.snapshotProcessor(
  types.model("PermitCollaborationModel", {
    id: types.identifier,
    collaborationType: types.enumeration(Object.values(ECollaborationType)),
    collaboratorType: types.enumeration(Object.values(ECollaboratorType)),
    assignedRequirementBlockId: types.maybeNull(types.string),
    collaborator: types.reference(types.late(() => CollaboratorModel)),
  }),
  {
    preProcessor(snapshot: any) {
      return {
        ...snapshot,
        collaborator: snapshot.collaborator?.id,
      }
    },
  }
)

export interface IPermitCollaboration extends Instance<typeof PermitCollaborationModel> {}
