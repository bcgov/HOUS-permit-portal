import { IStateTreeNode, types } from "mobx-state-tree"
import { withEnvironment } from "../lib/with-environment"
import { IJurisdictionStore, JurisdictionStoreModel } from "./jurisdiction-store"
import { IPermitApplicationStore, PermitApplicationStoreModel } from "./permit-application-store"
import { IRequirementBlockStore, RequirementBlockStore } from "./requirement-block-store"
import { IRequirementTemplateStore, RequirementTemplateStore } from "./requirement-template-store"
import { ISessionStore, SessionStoreModel } from "./session-store"
import { IUIStore, UIStoreModel } from "./ui-store"
import { IUserStore, UserStoreModel } from "./user-store"

export const RootStoreModel = types
  .model("RootStoreModel")
  .props({
    uiStore: types.optional(UIStoreModel, {}),
    sessionStore: types.optional(SessionStoreModel, {}),
    userStore: types.optional(UserStoreModel, {}),
    permitApplicationStore: types.optional(PermitApplicationStoreModel, {}),
    jurisdictionStore: types.optional(JurisdictionStoreModel, {}),
    requirementBlockStore: types.optional(RequirementBlockStore, {}),
    requirementTemplateStore: types.optional(RequirementTemplateStore, {}),
  })
  .extend(withEnvironment())
  .views((self) => ({}))
  .actions((self) => ({}))

export interface IRootStore extends IStateTreeNode {
  uiStore: IUIStore
  sessionStore: ISessionStore
  permitApplicationStore: IPermitApplicationStore
  jurisdictionStore: IJurisdictionStore
  userStore: IUserStore
  requirementBlockStore: IRequirementBlockStore
  requirementTemplateStore: IRequirementTemplateStore
}
