import { Instance, types } from "mobx-state-tree"
import { ECollaboratorAccess, EProjectAccess, EProjectTeamKind, ETeamAccess } from "../types/enums"

export const ProjectTeamModel = types.model("ProjectTeamModel", {
  id: types.identifier,
  name: types.string,
  kind: types.enumeration(Object.values(EProjectTeamKind)),
  projectAccess: types.enumeration(Object.values(EProjectAccess)),
  collaboratorAccess: types.enumeration(Object.values(ECollaboratorAccess)),
  teamAccess: types.enumeration(Object.values(ETeamAccess)),
  // Auto teams derive their members from role, so membership is not editable.
  // TODO(phase 2): custom teams with explicit membership.
  isAuto: types.optional(types.boolean, true),
  memberIds: types.optional(types.array(types.string), []),
})

export interface IProjectTeam extends Instance<typeof ProjectTeamModel> {}
