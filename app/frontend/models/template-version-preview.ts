import { Instance, types } from "mobx-state-tree"
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

export interface ITemplateVersionPreview extends Instance<typeof TemplateVersionPreviewModel> {}
