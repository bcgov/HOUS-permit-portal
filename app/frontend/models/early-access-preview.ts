import { Instance, flow, types } from "mobx-state-tree"
import { withEnvironment } from "../lib/with-environment"
import { withRootStore } from "../lib/with-root-store"
import { EPreviewStatus } from "../types/enums"
import { UserModel } from "./user"

export const EarlyAccessPreviewModel = types
  .model("EarlyAccessPreviewModel", {
    id: types.identifier,
    createdAt: types.Date,
    expiresAt: types.Date,
    discardedAt: types.maybeNull(types.Date),
    previewer: types.safeReference(UserModel),
  })
  .extend(withRootStore())
  .extend(withEnvironment())
  .views((self) => ({
    get status(): EPreviewStatus {
      if (self.discardedAt) {
        return EPreviewStatus.revoked
      }

      // Check if the current date is after expiresAt
      if (new Date() > self.expiresAt) {
        return EPreviewStatus.expired
      }

      // Check the confirmedAt property of the previewer
      if (!self.previewer?.confirmedAt) {
        return EPreviewStatus.invited
      }

      return EPreviewStatus.access
    },
  }))
  .actions((self) => ({
    revoke: flow(function* () {
      // Call the API to revoke the early access preview
      const response = yield self.environment.api.revokeEarlyAccess(self.id)

      if (response.ok) {
        // Update the expiresAt date locally
        self.discardedAt = response.data.data.discardedAt
        return true
      }

      return response.ok
    }),
    unrevoke: flow(function* () {
      // Call the API to unrevoke the early access preview
      const response = yield self.environment.api.unrevokeEarlyAccess(self.id)

      if (response.ok) {
        // Update the expiresAt date locally
        self.discardedAt = response.data.data.discardedAt
        return true
      }

      return response.ok
    }),
    extend: flow(function* () {
      // Call the API to extend the early access preview
      const response = yield self.environment.api.extendEarlyAccess(self.id)

      if (response.ok) {
        // Update the expiresAt date locally
        self.expiresAt = response.data.data.expiresAt
        return true
      }
    }),
  }))

export interface IEarlyAccessPreview extends Instance<typeof EarlyAccessPreviewModel> {}
