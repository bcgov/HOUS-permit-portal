// Reference: https://auth0.com/blog/role-based-access-control-rbac-and-react-apps/#Role-Based-Access-Control-Example-in-React-Apps

import { IJurisdiction } from "../models/jurisdiction"
import { IUser } from "../models/user"
import { EUserRoles } from "../types/enums"

const sharedStaticRules = ["jurisdiction:view"]

const sharedDynamicRules = {
  "user:manage": (currentUser: IUser, data: { user: IUser }) => userRule(currentUser, data),
}

const reviewManagerRules = {
  static: [...sharedStaticRules, "user:invite", "application:download", "user:updateRole"],
  dynamic: {
    ...sharedDynamicRules,
    "jurisdiction:manage": (currentUser: IUser, data: { jurisdiction?: IJurisdiction | null }) =>
      jurisdictionRule(currentUser, data),
  },
}

export const rules = {
  [EUserRoles.superAdmin]: {
    static: [
      ...sharedStaticRules,
      "jurisdiction:create",
      "jurisdiction:manage",
      "user:invite",
      "requirementTemplate:manage",
    ],
    dynamic: { ...sharedDynamicRules },
  },
  [EUserRoles.reviewManager]: reviewManagerRules,
  [EUserRoles.regionalReviewManager]: reviewManagerRules,
  [EUserRoles.reviewer]: {
    static: [...sharedStaticRules, "user:view", "application:download"],
    dynamic: { ...sharedDynamicRules },
  },
  [EUserRoles.submitter]: {
    static: [...sharedStaticRules],
    dynamic: { ...sharedDynamicRules },
  },
  ["anonymous"]: {
    static: [],
    dynamic: {},
  },
  [EUserRoles.technicalSupport]: {
    static: [...sharedStaticRules, "user:invite", "jurisdiction:manage", "user:updateRole"],
    dynamic: { ...sharedDynamicRules },
  },
}

const userRule = (currentUser: IUser, data: { user: IUser }) => {
  const { user } = data
  return currentUser ? currentUser.id === user.id : false
}

const jurisdictionRule = (currentUser: IUser, data: { jurisdiction?: IJurisdiction | null }) => {
  const { jurisdiction } = data
  if (!jurisdiction || !currentUser) return false
  return currentUser.jurisdiction.id === jurisdiction.id
}
