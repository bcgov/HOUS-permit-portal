import { Instance, types } from "mobx-state-tree"
import * as R from "ramda"
import { withEnvironment } from "../lib/with-environment"
import { withMerge } from "../lib/with-merge"
import { withRootStore } from "../lib/with-root-store"
import { TemplateVersionPreviewModel } from "../models/template-version-preview"

export const TemplateVersionPreviewStoreModel = types
  .model("TemplateVersionPreviewStore", {
    templateVersionPreviewsMap: types.map(TemplateVersionPreviewModel),
  })
  .extend(withEnvironment())
  .extend(withRootStore())
  .extend(withMerge())
  .actions((self) => ({
    __beforeMergeUpdate(preview) {
      self.rootStore.userStore.mergeUpdate(preview.previewer, "usersMap")

      return R.mergeRight(preview, {
        previewer: preview.previewer?.id,
      })
    },
  }))
  .views((self) => ({
    get templateVersionPreviews() {
      return Array.from(self.templateVersionPreviewsMap.values())
    },

    getPreviewById(id: string) {
      return self.templateVersionPreviewsMap.get(id)
    },
  }))

export interface ITemplateVersionPreviewStoreModel extends Instance<typeof TemplateVersionPreviewStoreModel> {}
