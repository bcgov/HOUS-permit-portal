import { Instance, flow, types } from "mobx-state-tree"
import { isNil } from "ramda"
import { withEnvironment } from "../lib/with-environment"
import { withRootStore } from "../lib/with-root-store"

export const GeocoderStoreModel = types
  .model("GeocoderStoreModel")
  .props({
    fetchingPids: types.optional(types.boolean, false),
    fetchingJurisdiction: types.optional(types.boolean, false),
  })
  .extend(withRootStore())
  .extend(withEnvironment())
  .views((self) => ({}))
  .actions((self) => ({
    fetchSiteOptions: flow(function* (address: string) {
      const response: any = yield self.environment.api.fetchSiteOptions(address)
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
    fetchGeocodedJurisdiction: flow(function* (
      siteId: string,
      pid: string = null,
      includeLtsaMatcher: boolean = false
    ) {
      self.fetchingJurisdiction = true
      const response: any = yield self.environment.api.fetchGeocodedJurisdiction(siteId, pid, includeLtsaMatcher)
      let responseData = response?.data?.data
      const ltsaMatcher = response?.data?.meta?.ltsaMatcher ?? null
      self.fetchingJurisdiction = false
      if (response.ok) {
        if (responseData) {
          self.rootStore.jurisdictionStore.mergeUpdate(responseData, "jurisdictionMap")
          // Return the MST model instance instead of raw data
          const jurisdictionModel = self.rootStore.jurisdictionStore.getJurisdictionById(responseData.id)
          return { jurisdiction: jurisdictionModel, ltsaMatcher }
        }
        return { jurisdiction: null, ltsaMatcher }
      }
      return { jurisdiction: null, ltsaMatcher: null }
    }),
    fetchSiteDetailsFromPid: flow(function* (pid: string) {
      self.fetchingJurisdiction = true
      const response: any = yield self.environment.api.fetchSiteDetailsFromPid(pid)
      let responseData = response?.data?.data
      self.fetchingJurisdiction = false
      if (response.ok) {
        return responseData
      }
    }),
    fetchPinVerification: flow(function* (pin: string) {
      self.fetchingPids = true
      const response: any = yield self.environment.api.fetchPin(pin)
      if (response.ok && !isNil(response?.data?.pin)) {
        self.fetchingPids = false
        return true
      } else {
        self.fetchingPids = false
        return false
      }
    }),
  }))

export interface IGeocoderStore extends Instance<typeof GeocoderStoreModel> {}
