import { Instance, applySnapshot, flow, types } from "mobx-state-tree"
import { TSiteWideMessageConfiguration } from "../components/domains/super-admin/site-configuration-management/sitewide-message-screen.js"
import { withEnvironment } from "../lib/with-environment"
import { withRootStore } from "../lib/with-root-store"
import { IHelpLinkItems } from "../types/types.js"

// Define the SiteConfiguration model
export const SiteConfigurationStoreModel = types
  .model("SiteConfigurationStore")
  .props({
    configurationLoaded: types.optional(types.boolean, false),
    displaySitewideMessage: types.maybeNull(types.boolean),
    sitewideMessage: types.maybeNull(types.string),
    helpLinkItems: types.frozen<IHelpLinkItems>(),
  })
  .extend(withRootStore())
  .extend(withEnvironment())
  .actions((self) => ({
    fetchSiteConfiguration: flow(function* fetchSiteConfiguration() {
      const response: any = yield self.environment.api.fetchSiteConfiguration()
      if (response.ok) {
        let responseData = response.data.data
        applySnapshot(self, responseData)
      }
      return response.ok
    }),
    updateSiteConfiguration: flow(function* updateSiteConfiguration(siteConfiguration: TSiteWideMessageConfiguration) {
      const response: any = yield self.environment.api.updateSiteConfiguration(siteConfiguration)

      if (response.ok) {
        let responseData = response.data.data
        applySnapshot(self, responseData)
        self.configurationLoaded = true
      }
      return response.ok
    }),
  }))
  .actions((self) => ({
    afterCreate() {
      // Automatically fetch site configuration upon store creation
      self.fetchSiteConfiguration()
    },
  }))
  .views((self) => ({
    get shownHelpLinkItems() {
      if (!self?.helpLinkItems) return []

      return Object.values(self.helpLinkItems).filter((item) => item.show)
    },
  }))

export interface ISiteConfigurationStore extends Instance<typeof SiteConfigurationStoreModel> {}
