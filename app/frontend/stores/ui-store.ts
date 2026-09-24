import { Instance, types } from "mobx-state-tree"
import queryString from "query-string"
import { v4 as uuidv4 } from "uuid"
import { withRootStore } from "../lib/with-root-store"
import { FlashMessageModel } from "../models/flash-message"
import { captureMatomoLoginFailReason } from "../utils/matomo"

export const UIStoreModel = types
  .model("UIStoreModel")
  .props({
    flashMessage: types.optional(FlashMessageModel, {}),
    currentlySelectedJurisdictionId: types.maybeNull(types.string),
    rmJurisdictionSelectKey: types.optional(types.string, uuidv4()),
    scrollToSelector: types.optional(types.string, ""),
  })
  .extend(withRootStore())
  .views((self) => ({}))
  .actions((self) => ({
    showQueryParamFlash() {
      const query = queryString.parse(location.search)
      let dirty = false

      if ("loginReason" in query) {
        captureMatomoLoginFailReason(query.loginReason)
        delete query.loginReason
        dirty = true
      }

      if (query.flash) {
        const { type, title, message } = JSON.parse(query.flash as any)
        self.flashMessage.show(type, title, message, 5000) // show flash messages from the query param for longer
        delete query.flash
        dirty = true
      }

      if (dirty) {
        const newQueryString = queryString.stringify(query)
        window.history.replaceState({}, "", `${location.pathname}${newQueryString ? "?" + newQueryString : ""}`)
      }
    },
  }))
  .actions((self) => ({
    setCurrentlySelectedJurisdictionId(id: string) {
      self.currentlySelectedJurisdictionId = id
    },
    setScrollToSelector(selector: string) {
      self.scrollToSelector = selector
    },
    updateRmJurisdictionSelectKey() {
      self.rmJurisdictionSelectKey = uuidv4()
    },
    afterCreate() {
      self.showQueryParamFlash()
    },
  }))

export interface IUIStore extends Instance<typeof UIStoreModel> {}
