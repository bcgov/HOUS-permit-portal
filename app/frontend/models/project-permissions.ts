import { ECollaboratorAccess, EMeetingAccess, EProjectAccess } from "../types/enums"

// Effective project-wide permissions for the current user, as computed by the
// backend (per-domain max across the teams their membership puts them in).
export interface IProjectPermissions {
  projectAccess: EProjectAccess
  collaboratorAccess: ECollaboratorAccess
  meetingAccess: EMeetingAccess
}

export const EMPTY_PROJECT_PERMISSIONS: IProjectPermissions = {
  projectAccess: EProjectAccess.base,
  collaboratorAccess: ECollaboratorAccess.none,
  meetingAccess: EMeetingAccess.none,
}

export const PROJECT_ACCESS_ORDER = [EProjectAccess.base, EProjectAccess.read, EProjectAccess.edit]

export const COLLABORATOR_ACCESS_ORDER = [
  ECollaboratorAccess.none,
  ECollaboratorAccess.view,
  ECollaboratorAccess.manage,
]

export const MEETING_ACCESS_ORDER = [EMeetingAccess.none, EMeetingAccess.view, EMeetingAccess.manage]

// Levels are progressive, so "has permission" is a position comparison.
export const atLeastLevel = <T extends string>(order: T[], level: T | undefined, minimum: T): boolean =>
  order.indexOf(level as T) >= order.indexOf(minimum)
