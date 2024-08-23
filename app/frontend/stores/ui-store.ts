import { Instance, types } from "mobx-state-tree"
import queryString from "query-string"
import { v4 as uuidv4 } from "uuid"
import { withRootStore } from "../lib/with-root-store"
import { FlashMessageModel } from "../models/flash-message"

export const UIStoreModel = types
  .model("UIStoreModel")
  .props({
    flashMessage: types.optional(FlashMessageModel, {}),
    currentlySelectedJurisdictionId: types.maybeNull(types.string),
    rmJurisdictionSelectKey: types.optional(types.string, uuidv4()),
  })
  .extend(withRootStore())
  .views((self) => ({}))
  .actions((self) => ({
    showQueryParamFlash() {
      // check if there are any messages to show in the URL params
      const query = queryString.parse(location.search)

      if (query.flash) {
        const { type, title, message } = JSON.parse(query.flash as any)
        self.flashMessage.show(type, title, message, 5000) // show flash messages from the query param for longer
        // Remove the "flash" parameter
        delete query.flash

        // Reconstruct the query string without the "flash" parameter
        const newQueryString = queryString.stringify(query)

        // Update the URL
        const newUrl = `${location.pathname}${newQueryString ? "?" + newQueryString : ""}`
        window.history.replaceState({}, "", newUrl)
      }
    },
  }))
  .actions((self) => ({
    setCurrentlySelectedJurisdictionId(id: string) {
      self.currentlySelectedJurisdictionId = id
    },
    updateRmJurisdictionSelectKey() {
      self.rmJurisdictionSelectKey = uuidv4()
    },
    afterCreate() {
      self.showQueryParamFlash()
    },
  }))

export interface IUIStore extends Instance<typeof UIStoreModel> {}
