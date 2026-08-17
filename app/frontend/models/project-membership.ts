import { Instance, types } from "mobx-state-tree"
import { EProjectMembershipRole, EProjectTeamKind } from "../types/enums"

export interface IProjectMemberUser {
  id: string
  email: string
  firstName?: string
  lastName?: string
  organization?: string
  confirmedAt?: number | null
}

export const ProjectMembershipModel = types
  .model("ProjectMembershipModel", {
    id: types.identifier,
    permitProjectId: types.string,
    role: types.enumeration(Object.values(EProjectMembershipRole)),
    user: types.frozen<IProjectMemberUser>(),
    teamKinds: types.optional(types.array(types.enumeration(Object.values(EProjectTeamKind))), []),
    isInvitationPending: types.optional(types.boolean, false),
    invitedByName: types.maybeNull(types.string),
    createdAt: types.maybeNull(types.Date),
  })
  .views((self) => ({
    get name() {
      return [self.user?.firstName, self.user?.lastName].filter(Boolean).join(" ") || self.user?.email
    },
  }))

export interface IProjectMembership extends Instance<typeof ProjectMembershipModel> {}
