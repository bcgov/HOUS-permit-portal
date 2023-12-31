import { Instance, flow, types } from "mobx-state-tree"
import * as R from "ramda"
import { withEnvironment } from "../lib/with-environment"
import { withRootStore } from "../lib/with-root-store"
import { IJurisdiction, JurisdictionModel } from "../models/jurisdiction"

export const JurisdictionStoreModel = types
  .model("JurisdictionStore")
  .props({
    jurisdictionMap: types.map(JurisdictionModel),
  })
  .extend(withEnvironment())
  .extend(withRootStore())
  .views((self) => ({
    // View to get a Jurisdiction by id
    getJurisdictionById(id: string) {
      return self.jurisdictionMap.get(id)
    },

    // View to get all jurisdictions as an array
    get jurisdictions() {
      return Array.from(self.jurisdictionMap.values())
    },

    get currentJurisdiction() {
      return {
        id: "0ee55726-8b7c-4a0d-9682-2731896fa244",
        name: "STUB JURISDICTION",
        description: "STUB DEFINITION",
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    },
  }))
  .actions((self) => ({
    // Action to add a new Jurisdiction
    addJurisdiction(jurisdiction: IJurisdiction) {
      self.jurisdictionMap.put(jurisdiction)
    },
    // Action to remove a Jurisdiction
    removeJurisdiction(id: string) {
      self.jurisdictionMap.delete(id)
    },
    // Example of an asynchronous action to fetch jurisdictions from an API
    fetchJurisdictions: flow(function* () {
      const { ok, data: response } = yield self.environment.api.fetchJurisdictions()
      if (ok) R.map((j) => self.jurisdictionMap.put(j), response.data)
    }),
    fetchJurisdiction: flow(function* (id: string) {
      let jurisdiction = self.getJurisdictionById(id)
      if (!jurisdiction) {
        // Jurisdiction not found in the map, fetch from API
        const { ok, data: response } = yield self.environment.api.fetchJurisdiction(id)
        if (ok && response.data) {
          jurisdiction = JurisdictionModel.create(response.data)
          self.jurisdictionMap.put(jurisdiction)
        }
      }
      return jurisdiction
    }),
  }))

export interface IJurisdictionStore extends Instance<typeof JurisdictionStoreModel> {}
