import { Instance, types } from "mobx-state-tree"
import { UserModel } from "./user"

export const CollaboratorModel = types.snapshotProcessor(
  types
    .model("CollaboratorModel", {
      id: types.identifier,
      jurisdictionId: types.string,
      user: types.reference(types.late(() => UserModel)),
    })
    .views((self) => ({
      get userName() {
        return self.user?.name
      },
    })),
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
