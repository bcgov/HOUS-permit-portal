import { Instance, flow, types } from "mobx-state-tree"
import { withEnvironment } from "../lib/with-environment"
import { withRootStore } from "../lib/with-root-store"

export const GeocoderStoreModel = types
  .model("GeocoderStoreModel")
  .props({
    fetchingPids: types.optional(types.boolean, false),
  })
  .extend(withRootStore())
  .extend(withEnvironment())
  .views((self) => ({}))
  .actions((self) => ({
    fetchSiteOptions: flow(function* (address: string, pid: string = null) {
      const response: any = yield self.environment.api.fetchSiteOptions(address, pid)
      if (response.ok) {
        let responseData = response.data.data
        return responseData
      }
      return response.ok
    }),
    fetchPids: flow(function* (siteId: string) {
      self.fetchingPids = true
      const response: any = yield self.environment.api.fetchPids(siteId)
      if (response.ok) {
        let responseData = response.data
        self.fetchingPids = false
        return responseData
      }
      self.fetchingPids = false
      return response.ok
    }),
    fetchGeocodedJurisdiction: flow(function* (siteId: string) {
      const response: any = yield self.environment.api.fetchGeocodedJurisdiction(siteId)
      let responseData = response?.data?.data
      if (response.ok) {
        self.rootStore.jurisdictionStore.addJurisdiction(responseData)
        return responseData
      }
    }),
  }))

export interface IGeocoderStore extends Instance<typeof GeocoderStoreModel> {}
