import { Instance, types } from "mobx-state-tree"

export const ProjectGrantModel = types.model("ProjectGrantModel", {
  id: types.identifier,
  kind: types.enumeration(["block", "application", "invite"]),
  projectMembershipId: types.string,
  permitApplicationId: types.maybeNull(types.string),
  requirementBlockId: types.maybeNull(types.string),
  memberName: types.maybeNull(types.string),
})

export interface IProjectGrant extends Instance<typeof ProjectGrantModel> {}
