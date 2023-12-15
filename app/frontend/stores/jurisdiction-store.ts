import { Instance, flow, types } from "mobx-state-tree"
import { IJurisdiction, JurisdictionModel } from "../models/jurisdiction"

export const JurisdictionStoreModel = types
  .model("JurisdictionStore", {
    jurisdictionsMap: types.map(JurisdictionModel),
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

export interface IJurisdictionStore extends Instance<typeof JurisdictionStoreModel> {}
