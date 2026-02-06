import { makePersistable } from "mobx-persist-store"
import { IStateTreeNode, flow, protect, types, unprotect } from "mobx-state-tree"
import { createUserChannelConsumer } from "../channels/user_channel"
import { withEnvironment } from "../lib/with-environment"
import { CollaboratorStoreModel, ICollaboratorStore } from "./collaborator-store"
import { ContactStoreModel, IContactStore } from "./contact-store"
import { DigitalSealValidatorStoreModel, IDigitalSealValidatorStore } from "./digital-seal-validator-store"
import { EarlyAccessPreviewStoreModel, IEarlyAccessPreviewStoreModel } from "./early-access-preview-store"
import {
  EarlyAccessRequirementBlockStoreModel,
  IEarlyAccessRequirementBlockStoreModel,
} from "./early-access-requirement-block-store"
import {
  EarlyAccessRequirementTemplateStoreModel,
  IEarlyAccessRequirementTemplateStoreModel,
} from "./early-access-requirement-template-store"
import { GeocoderStoreModel, IGeocoderStore } from "./geocoder-store"
import { IJurisdictionStore, JurisdictionStoreModel } from "./jurisdiction-store"
import { INotificationStore, NotificationStoreModel } from "./notification-store"
import { IOverheatingToolStore, OverheatingToolStoreModel } from "./overheating-tool-store"
import { IPermitApplicationStore, PermitApplicationStoreModel } from "./permit-application-store"
import { IPermitClassificationStore, PermitClassificationStoreModel } from "./permit-classification-store"
import { IPermitProjectStore, PermitProjectStoreModel } from "./permit-project-store"
import { IPreCheckStore, PreCheckStoreModel } from "./pre-check-store"
import { IRequirementBlockStoreModel, RequirementBlockStoreModel } from "./requirement-block-store"
import { IRequirementTemplateStoreModel, RequirementTemplateStoreModel } from "./requirement-template-store"
import { ISandboxStore, SandboxStoreModel } from "./sandbox-store"
import { ISessionStore, SessionStoreModel } from "./session-store"
import { ISiteConfigurationStore, SiteConfigurationStoreModel } from "./site-configuration-store"
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
    permitProjectStore: types.optional(PermitProjectStoreModel, {}),
    permitClassificationStore: types.optional(PermitClassificationStoreModel, {}),
    preCheckStore: types.optional(PreCheckStoreModel, {}),
    jurisdictionStore: types.optional(JurisdictionStoreModel, {}),
    requirementBlockStore: types.optional(RequirementBlockStoreModel, {}),
    earlyAccessRequirementBlockStore: types.optional(EarlyAccessRequirementBlockStoreModel, {}),
    requirementTemplateStore: types.optional(RequirementTemplateStoreModel, {}),
    earlyAccessRequirementTemplateStore: types.optional(EarlyAccessRequirementTemplateStoreModel, {}),
    digitalSealValidatorStore: types.optional(DigitalSealValidatorStoreModel, {}),
    earlyAccessPreviewStore: types.optional(EarlyAccessPreviewStoreModel, {}),
    collaboratorStore: types.optional(CollaboratorStoreModel, {}),
    templateVersionStore: types.optional(TemplateVersionStoreModel, {}),
    geocoderStore: types.optional(GeocoderStoreModel, {}),
    stepCodeStore: types.optional(StepCodeStoreModel, {}),
    siteConfigurationStore: types.optional(SiteConfigurationStoreModel, {}),
    contactStore: types.optional(ContactStoreModel, {}),
    notificationStore: types.optional(NotificationStoreModel, {}),
    sandboxStore: types.optional(SandboxStoreModel, {}),
    overheatingToolStore: types.optional(OverheatingToolStoreModel, {}),
  })
  .extend(withEnvironment())
  .volatile((self) => ({
    userChannelConsumer: null,
  }))
  .views((self) => ({}))
  .actions((self) => ({
    loadLocalPersistedData: flow(function* () {
      unprotect(self)
      yield makePersistable(self.sessionStore, {
        name: `SessionStore`,
        properties: ["afterLoginPath"],
        storage: localStorage,
      })
      yield makePersistable(self.uiStore, {
        name: `${self.userStore.currentUser?.id}-UIStore`,
        properties: ["currentlySelectedJurisdictionId"],
        storage: localStorage,
      })
      if (!self.userStore.currentUser?.isSuperAdmin || self.sandboxStore.temporarilyPersistingSandboxId) {
        yield makePersistable(self.sandboxStore, {
          name: `SandboxStore`,
          properties: ["currentSandboxId"],
          storage: localStorage,
        })
      } else {
        localStorage.removeItem("SandboxStore")
      }
      protect(self)
    }),
    subscribeToUserChannel() {
      if (!self.userChannelConsumer && self.userStore.currentUser) {
        self.userChannelConsumer = createUserChannelConsumer(
          self.userStore.currentUser.id,
          self as unknown as IRootStore
        )
      }
    },
    disconnectUserChannel() {
      self.userChannelConsumer?.consumer?.disconnect()
    },
  }))
  .actions((self) => ({
    updatePath() {
      Object.values(self).forEach((store) => {
        // Check if the store exists and has a resetAll method
        if (store && typeof store.resetAll === "function") {
          store.syncWithUrl()
        }
      })
    },
    afterCreate() {
      self.loadLocalPersistedData()
    },
  }))

export interface IRootStore extends IStateTreeNode {
  uiStore: IUIStore
  sessionStore: ISessionStore
  permitApplicationStore: IPermitApplicationStore
  permitProjectStore: IPermitProjectStore
  permitClassificationStore: IPermitClassificationStore
  preCheckStore: IPreCheckStore
  jurisdictionStore: IJurisdictionStore
  userStore: IUserStore
  earlyAccessRequirementBlockStore: IEarlyAccessRequirementBlockStoreModel
  requirementBlockStore: IRequirementBlockStoreModel
  requirementTemplateStore: IRequirementTemplateStoreModel
  earlyAccessRequirementTemplateStore: IEarlyAccessRequirementTemplateStoreModel
  digitalSealValidatorStore: IDigitalSealValidatorStore
  earlyAccessPreviewStore: IEarlyAccessPreviewStoreModel
  templateVersionStore: ITemplateVersionStoreModel
  geocoderStore: IGeocoderStore
  stepCodeStore: IStepCodeStore
  siteConfigurationStore: ISiteConfigurationStore
  contactStore: IContactStore
  notificationStore: INotificationStore
  collaboratorStore: ICollaboratorStore
  sandboxStore: ISandboxStore
  overheatingToolStore: IOverheatingToolStore
  subscribeToUserChannel: () => void
  disconnectUserChannel: () => void
  loadLocalPersistedData: () => void
  updatePath: (path: string) => void
}
