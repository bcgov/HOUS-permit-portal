import { isFuture } from "date-fns"
import { Instance, types } from "mobx-state-tree"
import { ExternalApiKeyStatus } from "../types/enums"

export const ExternalApiKeyModel = types
  .model("ExternalApiKeyModel")
  .props({
    id: types.identifier,
    name: types.string,
    connectingApplication: types.string,
    webhookUrl: types.maybeNull(types.string),
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
  }))
  .views((self) => ({
    get status() {
      return self.isRevoked || self.isExpired ? ExternalApiKeyStatus.notActive : ExternalApiKeyStatus.active
    },
  }))

export interface IExternalApiKey extends Instance<typeof ExternalApiKeyModel> {}
