import { Instance, types } from "mobx-state-tree"
import { EProjectAccess, EProjectContactDesignation, EProjectMembershipStatus } from "../types/enums"

export const ProjectMembershipModel = types.model("ProjectMembershipModel", {
  id: types.identifier,
  userId: types.maybeNull(types.string),
  name: types.string,
  firstName: types.maybeNull(types.string),
  organization: types.maybeNull(types.string),
  roleTags: types.optional(types.array(types.string), []),
  access: types.maybeNull(types.enumeration(Object.values(EProjectAccess))),
  contactDesignation: types.enumeration(Object.values(EProjectContactDesignation)),
  status: types.enumeration(Object.values(EProjectMembershipStatus)),
  canEditRoleTags: types.optional(types.boolean, false),
  allowInvite: types.optional(types.boolean, false),
})

export interface IProjectMembership extends Instance<typeof ProjectMembershipModel> {}
