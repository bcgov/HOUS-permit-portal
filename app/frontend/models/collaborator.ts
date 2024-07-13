import { Instance, types } from "mobx-state-tree"
import { ECollaboratorableType } from "../types/enums"
import { UserModel } from "./user"

export const CollaboratorModel = types.model("CollaboratorModel", {
  id: types.identifier,
  collaboratorableType: types.enumeration(Object.values(ECollaboratorableType)),
  collaboratorableId: types.string,
  // collaboratorable: types.string,
  user: types.reference(UserModel),
})

export interface ICollaborator extends Instance<typeof CollaboratorModel> {}
