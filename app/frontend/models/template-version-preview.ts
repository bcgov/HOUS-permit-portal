import { Instance, flow, types } from "mobx-state-tree"
import { withEnvironment } from "../lib/with-environment"
import { withRootStore } from "../lib/with-root-store"
import { EPreviewStatus } from "../types/enums"
import { UserModel } from "./user"

export const TemplateVersionPreviewModel = types
  .model("TemplateVersionPreviewModel", {
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

      if (new Date() > self.expiresAt) {
        return EPreviewStatus.expired
      }

      if (!self.previewer?.confirmedAt) {
        return EPreviewStatus.invited
      }

      return EPreviewStatus.access
    },
  }))
  .actions((self) => ({
    revoke: flow(function* () {
      const response: any = yield self.environment.api.revokeTemplateVersionPreview(self.id)
      if (response.ok) {
        self.discardedAt = response.data.data.discardedAt ? new Date(response.data.data.discardedAt) : null
        return true
      }
      return false
    }),
    unrevoke: flow(function* () {
      const response: any = yield self.environment.api.unrevokeTemplateVersionPreview(self.id)
      if (response.ok) {
        self.discardedAt = response.data.data.discardedAt ? new Date(response.data.data.discardedAt) : null
        return true
      }
      return false
    }),
    extend: flow(function* () {
      const response: any = yield self.environment.api.extendTemplateVersionPreview(self.id)
      if (response.ok) {
        self.expiresAt = new Date(response.data.data.expiresAt)
        return true
      }
      return false
    }),
  }))

export interface ITemplateVersionPreview extends Instance<typeof TemplateVersionPreviewModel> {}
