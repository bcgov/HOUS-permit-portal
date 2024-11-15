import { isFuture } from "date-fns"
import { getParent, Instance, types } from "mobx-state-tree"
import { ETemplateVersionStatus, ExternalApiKeyStatus } from "../types/enums"

export const ExternalApiKeyModel = types
  .model("ExternalApiKeyModel")
  .props({
    id: types.identifier,
    name: types.string,
    connectingApplication: types.string,
    webhookUrl: types.maybeNull(types.string),
    notificationEmail: types.maybeNull(types.string),
    sandboxId: types.maybeNull(types.string),
    statusScope: types.maybeNull(types.enumeration(Object.values(ETemplateVersionStatus))),
    expiredAt: types.Date,
    revokedAt: types.maybeNull(types.Date),
    createdAt: types.Date,
  })
  .views((self) => ({
    get isExpired() {
      return self.expiredAt !== null && !isFuture(self.expiredAt)
    },
    get isRevoked() {
      // any revokedAt date is considered revoked, time is for logging purposes
      return self.revokedAt !== null
    },
    get jurisdiction() {
      return getParent(self, 2)
    },
  }))
  .views((self) => ({
    get status() {
      return !(
        self.jurisdiction as {
          externalApiEnabled: boolean
        }
      )?.externalApiEnabled ||
        self.isRevoked ||
        self.isExpired
        ? ExternalApiKeyStatus.notActive
        : ExternalApiKeyStatus.active
    },
  }))

export interface IExternalApiKey extends Instance<typeof ExternalApiKeyModel> {}
