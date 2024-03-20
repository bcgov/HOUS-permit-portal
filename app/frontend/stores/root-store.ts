import { IStateTreeNode, types } from "mobx-state-tree"
import { createUserChannelConsumer } from "../channels/user_channel"
import { withEnvironment } from "../lib/with-environment"
import { GeocoderStoreModel, IGeocoderStore } from "./geocoder-store"
import { IJurisdictionStore, JurisdictionStoreModel } from "./jurisdiction-store"
import { IPermitApplicationStore, PermitApplicationStoreModel } from "./permit-application-store"
import { IPermitClassificationStore, PermitClassificationStoreModel } from "./permit-classification-store"
import { IRequirementBlockStoreModel, RequirementBlockStoreModel } from "./requirement-block-store"
import { IRequirementTemplateStoreModel, RequirementTemplateStoreModel } from "./requirement-template-store"
import { ISessionStore, SessionStoreModel } from "./session-store"
import { IStepCodeStore, StepCodeStoreModel } from "./step-code-store"
import { ITemplateVersionStoreModel, TemplateVersionStoreModel } from "./template-version-store"
import { IUIStore, UIStoreModel } from "./ui-store"
import { IUserStore, UserStoreModel } from "./user-store"

export const RootStoreModel = types
  .model("RootStoreModel")
  .props({
    uiStore: types.optional(UIStoreModel, {}),
    sessionStore: types.optional(SessionStoreModel, {}),
    userStore: types.optional(UserStoreModel, {}),
    permitApplicationStore: types.optional(PermitApplicationStoreModel, {}),
    permitClassificationStore: types.optional(PermitClassificationStoreModel, {}),
    jurisdictionStore: types.optional(JurisdictionStoreModel, {}),
    requirementBlockStore: types.optional(RequirementBlockStoreModel, {}),
    requirementTemplateStore: types.optional(RequirementTemplateStoreModel, {}),
    templateVersionStore: types.optional(TemplateVersionStoreModel, {}),
    geocoderStore: types.optional(GeocoderStoreModel, {}),
    stepCodeStore: types.optional(StepCodeStoreModel, {}),
  })
  .extend(withEnvironment())
  .volatile((self) => ({
    userChannelConsumer: null,
  }))
  .views((self) => ({}))
  .actions((self) => ({
    subscribeToUserChannel() {
      if (!self.userChannelConsumer && self.userStore.currentUser) {
        self.userChannelConsumer = createUserChannelConsumer(self.userStore.currentUser.id, self)
      }
    },
    disconnectUserChannel() {
      self.userChannelConsumer?.consumer.disconnect()
    },
  }))

export interface IRootStore extends IStateTreeNode {
  uiStore: IUIStore
  sessionStore: ISessionStore
  permitApplicationStore: IPermitApplicationStore
  permitClassificationStore: IPermitClassificationStore
  jurisdictionStore: IJurisdictionStore
  userStore: IUserStore
  requirementBlockStore: IRequirementBlockStoreModel
  requirementTemplateStore: IRequirementTemplateStoreModel
  templateVersionStore: ITemplateVersionStoreModel
  geocoderStore: IGeocoderStore
  stepCodeStore: IStepCodeStore
}
