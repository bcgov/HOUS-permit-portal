import { Instance, types } from "mobx-state-tree"
import { ECollaboratorAccess, EMeetingAccess, EProjectAccess, EProjectTeamKind } from "../types/enums"

export const ProjectTeamModel = types.model("ProjectTeamModel", {
  id: types.identifier,
  name: types.string,
  kind: types.enumeration(Object.values(EProjectTeamKind)),
  projectAccess: types.enumeration(Object.values(EProjectAccess)),
  collaboratorAccess: types.enumeration(Object.values(ECollaboratorAccess)),
  meetingAccess: types.enumeration(Object.values(EMeetingAccess)),
  // Auto teams derive their members from role, so only custom teams have an
  // editable membership list.
  isAuto: types.optional(types.boolean, true),
  projectMembershipIds: types.optional(types.array(types.string), []),
  memberIds: types.optional(types.array(types.string), []),
})

export interface IProjectTeam extends Instance<typeof ProjectTeamModel> {}

// projectMembershipIds only applies to custom teams; auto team membership is
// derived from each collaborator's role.
export type TProjectTeamParams = {
  name?: string
  projectAccess?: EProjectAccess
  collaboratorAccess?: ECollaboratorAccess
  meetingAccess?: EMeetingAccess
  projectMembershipIds?: string[]
}
