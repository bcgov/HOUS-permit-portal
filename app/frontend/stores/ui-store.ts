import { Instance, types } from "mobx-state-tree"
import queryString from "query-string"
import { withRootStore } from "../lib/with-root-store"
import { FlashMessageModel } from "../models/flash-message"

export const UIStoreModel = types
  .model("UIStoreModel")
  .props({
    flashMessage: types.optional(FlashMessageModel, {}),
  })
  .extend(withRootStore())
  .views((self) => ({}))
  .actions((self) => ({
    afterCreate() {
      // check if there are any messages to show in the URL params
      const query = queryString.parse(location.search)

      if (query.flash) {
        const { type, title, message } = JSON.parse(query.flash as any)
        self.flashMessage.show(type, title, message, 5000) // show flash messages from the backend for longer
        // remove the frontend flash message from URL
        window.history.replaceState({}, "", location.pathname)
      }
    },
  }))

export interface IUIStore extends Instance<typeof UIStoreModel> {}
