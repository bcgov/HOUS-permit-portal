import { Instance, flow, types } from "mobx-state-tree"
import { withEnvironment } from "../lib/with-environment"
import { withRootStore } from "../lib/with-root-store"

export const GeocoderStoreModel = types
  .model("GeocoderStoreModel")
  .props({
    // flashMessage: types.optional(FlashMessageModel, {}),
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
    fetchPid: flow(function* (siteId: string) {
      const response: any = yield self.environment.api.fetchPid(siteId)
      if (response.ok) {
        let responseData = response.data
        return responseData
      }
      return response.ok
    }),
  }))

export interface IGeocoderStore extends Instance<typeof GeocoderStoreModel> {}
