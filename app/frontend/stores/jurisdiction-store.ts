import { Instance, flow, types } from "mobx-state-tree"
import Jurisdiction, { IJurisdictionModel } from "../models/jurisdiction"

export const JurisdictionStore = types
  .model("JurisdictionStore", {
    jurisdictionsMap: types.map(Jurisdiction),
  })
  .views((self) => ({
    // View to get a Jurisdiction by id
    getJurisdictionById(id: string) {
      return self.jurisdictionsMap.get(id)
    },

    // View to get all jurisdictions as an array
    get Jurisdictions() {
      return Array.from(self.jurisdictionsMap.values())
    },
  }))
  .actions((self) => ({
    // Action to add a new Jurisdiction
    addJurisdiction(jurisdiction: IJurisdictionModel) {
      self.jurisdictionsMap.put(jurisdiction)
    },
    // Action to remove a Jurisdiction
    removeJurisdiction(id: string) {
      self.jurisdictionsMap.delete(id)
    },
    // Example of an asynchronous action to fetch jurisdictions from an API
    fetchJurisdictions: flow(function* () {
      // try {
      //   const response = yield fetch("/api/jurisdictions");
      //   const jurisdictions = yield response.json();
      //   applySnapshot(self.jurisdictions, jurisdictions);
      // } catch (error) {
      //   console.error("Failed to fetch jurisdictions", error);
      // }
    }),
  }))

export interface IJurisdictionStore extends Instance<typeof JurisdictionStore> {}
