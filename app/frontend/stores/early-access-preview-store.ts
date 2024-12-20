import { Instance, types } from "mobx-state-tree"
import * as R from "ramda"
import { withEnvironment } from "../lib/with-environment"
import { withMerge } from "../lib/with-merge"
import { withRootStore } from "../lib/with-root-store"
import { EarlyAccessPreviewModel } from "../models/early-access-preview"

export const EarlyAccessPreviewStoreModel = types
  .model("EarlyAccessPreviewStore", {
    earlyAccessPreviewsMap: types.map(EarlyAccessPreviewModel),
  })
  .extend(withEnvironment())
  .extend(withRootStore())
  .extend(withMerge())
  .actions((self) => ({
    __beforeMergeUpdate(eap) {
      self.rootStore.userStore.mergeUpdate(eap.previewer, "usersMap")

      return R.mergeRight(eap, {
        previewer: eap.previewer?.id,
      })
    },
  }))
  .views((self) => ({
    // Computed property to get all previews as an array
    get earlyAccessPreviews() {
      return Array.from(self.earlyAccessPreviewsMap.values())
    },

    // Get a preview by ID
    getPreviewById(id: string) {
      return self.earlyAccessPreviewsMap.get(id)
    },
  }))

export interface IEarlyAccessPreviewStoreModel extends Instance<typeof EarlyAccessPreviewStoreModel> {}
