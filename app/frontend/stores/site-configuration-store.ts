import { t } from "i18next"
import { Instance, applySnapshot, flow, types } from "mobx-state-tree"
import { TSiteConfiguration } from "../components/domains/super-admin/site-configuration-management-screen.tsx"
import { withEnvironment } from "../lib/with-environment"
import { withRootStore } from "../lib/with-root-store"

// Define the SiteConfiguration model
export const SiteConfigurationStoreModel = types
  .model("SiteConfigurationStore")
  .props({
    configurationLoaded: types.optional(types.boolean, false),
    maintenanceMode: types.optional(types.boolean, false),
    maintenanceMessage: types.maybeNull(types.string),
  })
  .extend(withRootStore())
  .extend(withEnvironment())
  .actions((self) => ({
    // Async action to fetch the maintenance mode from the server
    fetchSiteConfiguration: flow(function* fetchSiteConfiguration() {
      const response: any = yield self.environment.api.fetchSiteConfiguration()
      if (response.ok) {
        let responseData = response.data.data
        applySnapshot(self, responseData)
      }
      return response.ok
    }),
    updateSiteConfiguration: flow(function* updateSiteConfiguration(siteConfiguration: TSiteConfiguration) {
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
    // Any views to compute derived states or properties can be defined here
    get defaultedMaintenanceMessage() {
      return self.maintenanceMessage || t("siteConfiguration.defaultMaintenanceMessage")
    },
  }))

export interface ISiteConfigurationStore extends Instance<typeof SiteConfigurationStoreModel> {}
