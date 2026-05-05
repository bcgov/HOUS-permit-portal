import { Instance, types } from "mobx-state-tree"
import { CollaboratorModel } from "./collaborator"

export const PermitProjectCollaborationModel = types.snapshotProcessor(
  types.model("PermitProjectCollaborationModel", {
    id: types.identifier,
    collaborator: types.reference(types.late(() => CollaboratorModel)),
  }),
  {
    preProcessor(snapshot: any) {
      return {
        ...snapshot,
        collaborator: snapshot.collaborator?.id ?? snapshot.collaborator,
      }
    },
  }
)

export interface IPermitProjectCollaboration extends Instance<typeof PermitProjectCollaborationModel> {
  collaborator: any
}
