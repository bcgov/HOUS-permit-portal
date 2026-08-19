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

// Custom teams are named, so a kind alone cannot label them.
export interface IProjectMembershipTeam {
  id: string
  name: string
  kind: EProjectTeamKind
}

export const ProjectMembershipModel = types
  .model("ProjectMembershipModel", {
    id: types.identifier,
    permitProjectId: types.string,
    role: types.enumeration(Object.values(EProjectMembershipRole)),
    user: types.optional(types.maybeNull(types.frozen<IProjectMemberUser>()), null),
    invitedEmail: types.maybeNull(types.string),
    teams: types.optional(types.array(types.frozen<IProjectMembershipTeam>()), []),
    isInvitationPending: types.optional(types.boolean, false),
    invitedByName: types.maybeNull(types.string),
    createdAt: types.maybeNull(types.Date),
  })
  .views((self) => ({
    get email() {
      return self.invitedEmail || self.user?.email || ""
    },
    get name() {
      if (self.isInvitationPending) return ""
      return (
        [self.user?.firstName, self.user?.lastName].filter(Boolean).join(" ") ||
        self.invitedEmail ||
        self.user?.email ||
        ""
      )
    },
  }))

export interface IProjectMembership extends Instance<typeof ProjectMembershipModel> {}

export interface IProjectMembershipInvitation {
  id: string
  role: EProjectMembershipRole
  invitedEmail: string
  expired: boolean
  projectId: string
  projectTitle: string
  inviterName?: string | null
}
