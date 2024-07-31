import { Instance, types } from "mobx-state-tree"
import { ECollaboratorableType } from "../types/enums"
import { UserModel } from "./user"

export const CollaboratorModel = types.snapshotProcessor(
  types.model("CollaboratorModel", {
    id: types.identifier,
    collaboratorableType: types.enumeration(Object.values(ECollaboratorableType)),
    collaboratorableId: types.string,
    user: types.reference(types.late(() => UserModel)),
  }),
  {
    preProcessor(snapshot: any) {
      return {
        ...snapshot,
        user: snapshot.user?.id,
      }
    },
  }
)

export interface ICollaborator extends Instance<typeof CollaboratorModel> {}
