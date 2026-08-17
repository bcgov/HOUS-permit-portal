import { ECollaboratorAccess, EProjectAccess, ETeamAccess } from "../types/enums"

// Effective project-wide permissions for the current user, as computed by the
// backend (per-domain max across the teams their membership puts them in).
export interface IProjectPermissions {
  projectAccess: EProjectAccess
  collaboratorAccess: ECollaboratorAccess
  teamAccess: ETeamAccess
}

export const EMPTY_PROJECT_PERMISSIONS: IProjectPermissions = {
  projectAccess: EProjectAccess.none,
  collaboratorAccess: ECollaboratorAccess.none,
  teamAccess: ETeamAccess.none,
}

export const PROJECT_ACCESS_ORDER = [EProjectAccess.none, EProjectAccess.read, EProjectAccess.edit]

export const COLLABORATOR_ACCESS_ORDER = [
  ECollaboratorAccess.none,
  ECollaboratorAccess.view,
  ECollaboratorAccess.invite,
  ECollaboratorAccess.manage,
]

export const TEAM_ACCESS_ORDER = [ETeamAccess.none, ETeamAccess.view, ETeamAccess.manage]

// Levels are progressive, so "has permission" is a position comparison.
export const atLeastLevel = <T extends string>(order: T[], level: T | undefined, minimum: T): boolean =>
  order.indexOf(level as T) >= order.indexOf(minimum)
